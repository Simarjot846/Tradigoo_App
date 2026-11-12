import InvoiceClient from './invoice-client';

export function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

export default function InvoicePage() {
    return <InvoiceClient />;
}
