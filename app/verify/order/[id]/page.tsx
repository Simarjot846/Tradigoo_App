import OrderVerificationClient from './order-verify-client';

export function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function OrderVerificationPage() {
    return <OrderVerificationClient />;
}
