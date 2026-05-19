import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/features/categories/use-categories";

import type { Product, ProductFormValues } from "./types";
import { useCreateProduct, useUpdateProduct } from "./use-products";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

function isAcceptedImage(file: File) {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function buildProductFormData(values: ProductFormValues) {
  const formData = new FormData();
  formData.append("name", values.name.trim());
  formData.append("description", values.description.trim());
  formData.append("price", String(values.price));
  formData.append("category_id", values.category_id);
  if (values.image) {
    formData.append("image", values.image);
  }
  return formData;
}

interface ProductFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export function ProductFormDialog({
  mode,
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEdit = mode === "edit";
  const categoriesQuery = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = categoriesQuery.data ?? [];

  useEffect(() => {
    if (!open) return;

    if (isEdit && product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(String(product.price));
      setCategoryId(product.category_id);
      setImagePreview(product.image_url);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setImage(null);
      setImagePreview(null);
    }
  }, [open, isEdit, product]);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedImage(file)) {
      toast.error("Image must be a JPG, JPEG, or PNG file.");
      e.target.value = "";
      return;
    }

    setImage(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      toast.error("Product name is required.");
      return;
    }
    if (!trimmedDescription) {
      toast.error("Description is required.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    if (!categoryId) {
      toast.error("Select a category.");
      return;
    }
    if (!isEdit && !image) {
      toast.error("Product image is required.");
      return;
    }
    if (image && !isAcceptedImage(image)) {
      toast.error("Image must be a JPG, JPEG, or PNG file.");
      return;
    }

    const values: ProductFormValues = {
      name: trimmedName,
      description: trimmedDescription,
      price: parsedPrice,
      category_id: categoryId,
      ...(image ? { image } : {}),
    };

    const formData = buildProductFormData(values);

    if (isEdit && product) {
      updateMutation.mutate(
        { id: product.id, formData },
        {
          onSuccess: () => {
            toast.success(`"${trimmedName}" updated successfully.`);
            resetForm();
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(
              err instanceof Error ? err.message : "Failed to update product.",
            );
          },
        },
      );
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(`"${trimmedName}" created successfully.`);
        resetForm();
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to create product.",
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update product details. Leave the image empty to keep the current one."
              : "Add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="product-name">
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wireless Headphones"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Description" htmlFor="product-description">
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
              rows={3}
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Price (USD)" htmlFor="product-price">
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              disabled={isPending}
            />
          </FormField>

          <FormField label="Category" htmlFor="product-category">
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isPending || categoriesQuery.isLoading}
            >
              <SelectTrigger id="product-category">
                <SelectValue
                  placeholder={
                    categoriesQuery.isLoading
                      ? "Loading categories..."
                      : "Select a category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label={isEdit ? "Image (optional)" : "Image"}
            htmlFor="product-image"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted/30">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImagePlus className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  ref={fileInputRef}
                  id="product-image"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleImageChange}
                  disabled={isPending}
                  required={!isEdit}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, JPEG, or PNG.
                  {isEdit && " Upload only if replacing the image."}
                </p>
              </div>
            </div>
          </FormField>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <RefreshCw className="mr-2 size-4 animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
