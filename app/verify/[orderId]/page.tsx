import VerifyOrderClient from './verify-client';

export function generateStaticParams() {
    return [{ orderId: 'placeholder' }];
}

export default function VerifyOrderPage() {
    return <VerifyOrderClient />;
}
