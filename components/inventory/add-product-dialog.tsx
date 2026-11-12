'use client';

import { ProductFormDialog } from './product-form-dialog';

export function AddProductDialog({
  children,
  onProductAdded,
}: {
  children: React.ReactNode;
  onProductAdded?: () => void;
}) {
  return <ProductFormDialog onSuccess={onProductAdded}>{children}</ProductFormDialog>;
}
