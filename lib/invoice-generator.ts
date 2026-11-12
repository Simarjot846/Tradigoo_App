
export function generateInvoice(order: any) {
    return {
        invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
        date: new Date().toISOString(),
        seller: {
            name: order.product?.seller_id || "Wholesaler Inc.",
            gst: "29AAAAA0000A1Z5"
        },
        buyer: {
            name: "Retailer Store",
            address: "123 Market St, Bangalore"
        },
        items: [
            {
                name: order.product?.name,
                quantity: order.quantity,
                unitPrice: order.unit_price,
                total: order.total_amount,
                batch: `BATCH-${Math.floor(Math.random() * 10000)}`,
                expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ],
        logistics: {
            weight: `${(Math.random() * 5 + 1).toFixed(2)} kg`,
            packages: Math.ceil(order.quantity / 10),
            pickupProof: "Verified by Courier Partner"
        }
    };
}
