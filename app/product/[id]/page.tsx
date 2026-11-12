import ProductDetailClient from './product-client';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
