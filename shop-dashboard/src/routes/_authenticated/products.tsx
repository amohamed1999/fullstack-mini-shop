import { createFileRoute } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/features/products/product-form-dialog";
import type { Product } from "@/features/products/types";
import { useDeleteProduct, useProducts } from "@/features/products/use-products";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products — Atlas" }] }),
  component: ProductsPage,
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function ProductThumbnail({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  return (
    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/30">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="size-full object-cover"
        />
      ) : (
        <Package className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}

function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(search);
  const products = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total;

  const deleteMutation = useDeleteProduct();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  function handleConfirmDelete() {
    if (!deletingProduct) return;

    deleteMutation.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success(`"${deletingProduct.name}" deleted successfully.`);
        setDeletingProduct(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete product.",
        );
      },
    });
  }

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your products and inventory.
            {total !== undefined && (
              <span className="text-muted-foreground/80">
                {" "}
                · {products.length} of {total}
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="size-4" />
          New Product
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or description..."
          className="bg-background pl-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search products"
        />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load products</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Something went wrong."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && <ProductsTableSkeleton />}

      {!isLoading && !isError && products.length === 0 && (
        <div className="grid min-h-[400px] place-items-center rounded-lg border-2 border-dashed border-muted bg-muted/20">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-muted">
              <Package className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">
                {search ? "No matching products" : "No products found"}
              </h2>
              <p className="max-w-[280px] text-sm text-muted-foreground">
                {search
                  ? `No products match "${search}". Try different keywords or clear the search.`
                  : "You haven't added any products yet. Start by creating your first product."}
              </p>
            </div>
            {search ? (
              <Button
                variant="outline"
                onClick={() => setSearchInput("")}
                className="gap-1.5"
              >
                Clear search
              </Button>
            ) : (
              <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
                <Plus className="size-4" />
                Create Product
              </Button>
            )}
          </div>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail
                          imageUrl={product.image_url}
                          name={product.name}
                        />
                        <span className="min-w-0 truncate">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[280px] truncate text-muted-foreground md:table-cell">
                      {product.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(product.price)}
                    </TableCell>
              
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                          title="Edit product"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeletingProduct(product)}
                          title="Delete product"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ProductsLoadMore
              ref={loadMoreRef}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </CardContent>
        </Card>
      )}

      <ProductFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <ProductFormDialog
        mode="edit"
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct ?? undefined}
      />

      <AlertDialog
        open={deletingProduct !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingProduct?.name}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
            >
              {deleteMutation.isPending ? (
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

const ProductsLoadMore = forwardRef<
  HTMLDivElement,
  { hasNextPage: boolean | undefined; isFetchingNextPage: boolean }
>(function ProductsLoadMore({ hasNextPage, isFetchingNextPage }, ref) {
  if (!hasNextPage && !isFetchingNextPage) return null;

  return (
    <div
      ref={ref}
      className="flex min-h-14 items-center justify-center border-t py-4"
    >
      {isFetchingNextPage && (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      )}
    </div>
  );
});

function ProductsTableSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
