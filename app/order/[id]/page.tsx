import OrderTrackingClient from './order-client';

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
