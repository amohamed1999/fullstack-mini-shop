import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Tags,
  Plus,
  Search,
  LayoutGrid,
  List,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  Package,
  Eye,
  Sparkles,
  Layers,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/categories/use-categories";
import type { Category } from "@/features/categories/types";

export const Route = createFileRoute("/_authenticated/categories")({
  head: () => ({ meta: [{ title: "Categories — Atlas" }] }),
  component: CategoriesPage,
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function CopyButton({ text, tooltip = "Copy ID" }: { text: string; tooltip?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${tooltip} copied!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
      onClick={handleCopy}
      title={tooltip}
      id={`btn-copy-${text.slice(0, 8)}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function CategoriesPage() {
  const categoriesQuery = useCategories();
  // const productsQuery = useProducts();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const allCategories = categoriesQuery.data ?? [];

  // const products = productsQuery.data?.items ?? [];
  // const isProductsLoading = productsQuery.isLoading;

  // Search & view types states
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Create Category state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Auto sync slug from category name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewCategoryName(name);
    if (!isSlugEdited) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setNewCategorySlug(slug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategorySlug(e.target.value);
    setIsSlugEdited(true);
  };

  // Submit creation through API
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Slug validation
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(newCategorySlug)) {
      toast.error("Slug must contain only lowercase letters, numbers, and hyphens.");
      return;
    }

    // Check duplicate
    if (allCategories.some((c) => c.slug.toLowerCase() === newCategorySlug.toLowerCase())) {
      toast.error("A category with this slug already exists.");
      return;
    }

    createCategoryMutation.mutate(
      {
        name: newCategoryName.trim(),
        slug: newCategorySlug.trim(),
      },
      {
        onSuccess: () => {
          toast.success(`Category "${newCategoryName}" created successfully!`);
          // Reset form
          setNewCategoryName("");
          setNewCategorySlug("");
          setIsSlugEdited(false);
          setIsCreateOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to create category through API.");
        },
      }
    );
  };

  function handleConfirmDelete() {
    if (!deletingCategory) return;

    deleteCategoryMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        toast.success(`Category "${deletingCategory.name}" deleted successfully.`);
        if (selectedCategory?.id === deletingCategory.id) {
          setSelectedCategory(null);
        }
        setDeletingCategory(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete category.",
        );
      },
    });
  }

  // Filter Categories
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      const query = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        cat.id.toLowerCase().includes(query)
      );
    });
  }, [allCategories, searchQuery]);



  // Statistics computations
  const totalCategoriesCount = allCategories.length;



  const isFetching = categoriesQuery.isFetching

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure product catalog structures, organize store taxonomies, and view assigned items.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 cursor-pointer"
            id="btn-new-category"
          >
            <Plus className="size-4" />
            New Category
          </Button>
        </div>
      </header>

      {/* ERROR CARD CONTAINER */}
      {categoriesQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>API Integration Error</AlertTitle>
          <AlertDescription>
            {categoriesQuery.error instanceof Error
              ? categoriesQuery.error.message
              : "Could not fetch categories from http://localhost:3000/categories."}
          </AlertDescription>
        </Alert>
      )}

      {/* LOADING STATES */}
      {categoriesQuery.isLoading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-40">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between mt-6">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* POPULATED DASHBOARD */}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && (
        <>
          {/* STATS SUMMARY PANELS */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Taxonomy Metrics">
            {/* Total Categories */}
            <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 opacity-15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Categories
                </CardTitle>
                <div className="grid size-8 place-items-center rounded-md bg-indigo-500/10 text-indigo-500">
                  <Tags className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl font-bold">{totalCategoriesCount}</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Registered active store slots
                </p>
              </CardContent>
            </Card>
          </section>

          {/* INTERACTIVE CONTROLS PANEL */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm shadow-sm border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories by name, slug or identifier..."
                  className="pl-9 w-full bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="input-search-categories"
                />
              </div>

              {/* View layout controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">View style:</span>
                <div className="border rounded-lg bg-background p-0.5 flex items-center">
                  <Button
                    variant={viewType === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 cursor-pointer rounded-md"
                    onClick={() => setViewType("grid")}
                    title="Grid layout"
                    id="btn-view-grid"
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                  <Button
                    variant={viewType === "table" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 cursor-pointer rounded-md"
                    onClick={() => setViewType("table")}
                    title="Table layout"
                    id="btn-view-table"
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* FILTERED CATEGORIES CONTAINER */}
          {filteredCategories.length === 0 ? (
            <div className="grid min-h-[300px] place-items-center rounded-xl border-2 border-dashed bg-muted/10 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-muted">
                  <Tags className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">No matching categories</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  We couldn't find any categories matching "{searchQuery}". Try adjusting your keywords or clearing the search box.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer mt-2"
                  id="btn-clear-search"
                >
                  Clear search filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* GRID VIEW STYLE */}
              {viewType === "grid" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map((cat) => (
                      <Card
                        key={cat.id}
                        className="group overflow-hidden hover:shadow-md transition-all duration-300 border flex flex-col justify-between"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold tracking-tight truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                                <span className="truncate">{cat.name}</span>
                              </CardTitle>
                              <CardDescription className="font-mono text-[10px] tracking-tight truncate flex items-center gap-1">
                                <span>ID: {cat.id.slice(0, 8)}...</span>
                                <CopyButton text={cat.id} tooltip="Copy ID" />
                              </CardDescription>
                            </div>
                            <Badge variant="secondary" className="font-mono text-[10px] select-all shrink-0">
                              /{cat.slug}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4 pt-1 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Package className="size-3.5 text-muted-foreground/60" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs font-semibold cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-500 gap-1"
                              onClick={() => setSelectedCategory(cat)}
                              id={`btn-view-${cat.slug}`}
                            >
                              <Eye className="size-3.5" />
                              View Items
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete category"
                              onClick={() => setDeletingCategory(cat)}
                              id={`btn-delete-${cat.slug}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              )}

              {/* TABLE VIEW STYLE */}
              {viewType === "table" && (
                <Card className="overflow-hidden shadow-sm border">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="w-[120px]">Category ID</TableHead>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Slug Identifier</TableHead>
                          <TableHead className="text-right">Products Count</TableHead>
                          <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((cat) => (
                            <TableRow
                              key={cat.id}
                              className="group hover:bg-muted/40 cursor-pointer transition-colors"
                              onClick={() => setSelectedCategory(cat)}
                            >
                              {/* ID */}
                              <TableCell className="font-mono text-xs font-semibold text-primary">
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">#</span>
                                  <span className="truncate w-16 inline-block" title={cat.id}>
                                    {cat.id.slice(0, 8)}
                                  </span>
                                  <CopyButton text={cat.id} tooltip="Copy ID" />
                                </div>
                              </TableCell>

                              {/* Name */}
                              <TableCell className="font-medium text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="grid size-6 place-items-center rounded bg-primary/10 text-[10px] font-bold text-primary shrink-0 select-none">
                                    {cat.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="truncate max-w-[200px]">{cat.name}</span>
                                </div>
                              </TableCell>

                              {/* Slug */}
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="secondary" className="font-mono text-[10px] select-all">
                                    /{cat.slug}
                                  </Badge>
                                  <CopyButton text={cat.slug} tooltip="Copy Slug" />
                                </div>
                              </TableCell>

                              {/* Actions */}
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                    className="h-8 px-2 opacity-80 group-hover:opacity-100 transition-opacity gap-1 text-xs cursor-pointer hover:bg-primary/10 hover:text-primary"
                                    id={`btn-table-view-${cat.slug}`}
                                  >
                                    <Eye className="size-3.5" />
                                    View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                    title="Delete category"
                                    onClick={() => setDeletingCategory(cat)}
                                    id={`btn-table-delete-${cat.slug}`}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md bg-card shadow-xl border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">Create New Category</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new category catalog block to taxonomy trees. Slugs generate automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="category-name" className="text-xs font-semibold text-muted-foreground">
                Category Name
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Home & Kitchen"
                value={newCategoryName}
                onChange={handleNameChange}
                required
                className="w-full bg-background"
                autoFocus
                disabled={createCategoryMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="category-slug" className="text-xs font-semibold text-muted-foreground">
                  URL Slug Identifier
                </Label>
                {isSlugEdited && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsSlugEdited(false);
                      const slug = newCategoryName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "");
                      setNewCategorySlug(slug);
                      toast.info("Slug reset to automatic sync.");
                    }}
                    className="h-4 px-1 py-0 text-[10px] text-indigo-500 hover:bg-transparent"
                    disabled={createCategoryMutation.isPending}
                  >
                    Sync automatically
                  </Button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-muted-foreground select-none">/</span>
                <Input
                  id="category-slug"
                  placeholder="e.g., home-kitchen"
                  value={newCategorySlug}
                  onChange={handleSlugChange}
                  required
                  className="pl-6 w-full bg-background font-mono text-xs"
                  disabled={createCategoryMutation.isPending}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                This forms the browser path and must contain only lowercase, hyphens and numbers.
              </p>
            </div>

            <DialogFooter className="pt-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewCategoryName("");
                  setNewCategorySlug("");
                  setIsSlugEdited(false);
                }}
                className="cursor-pointer"
                id="btn-cancel-create"
                disabled={createCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer" id="btn-submit-create" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin inline" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL DRAWER / PRODUCTS DIALOG */}
      <Dialog
        open={selectedCategory !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-card p-0 overflow-hidden shadow-2xl border">
          {selectedCategory && (
            <div className="flex flex-col">
              {/* Receipt / Modal Header */}
              <div className="p-6 bg-muted/30 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold tracking-wider text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      TAXONOMY
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Category Inventory
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold tracking-tight mt-1.5 flex items-center gap-2">
                    <span>{selectedCategory.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] select-all scale-95 border-primary/20 bg-primary/5 text-primary">
                      /{selectedCategory.slug}
                    </Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 select-all">
                    Category ID: {selectedCategory.id}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CopyButton text={selectedCategory.id} tooltip="Copy ID" />
                  <CopyButton text={selectedCategory.slug} tooltip="Copy Slug" />
                </div>
              </div>


              {/* Details Footer */}
              <div className="p-4 bg-muted/20 border-t flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="cursor-pointer"
                  id="btn-close-detail"
                >
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open && !deleteCategoryMutation.isPending) setDeletingCategory(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingCategory?.name}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategoryMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategoryMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
