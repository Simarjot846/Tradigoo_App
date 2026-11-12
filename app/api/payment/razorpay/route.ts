import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency = 'INR' } = body;

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Check for missing or dummy keys
        const isInvalidKey = !keyId || !keySecret || keyId.includes('YOUR_KEY') || keyId.includes('placeholder');

        if (isInvalidKey) {
            console.warn("Razorpay keys missing or invalid. Using Mock Mode.");
            return NextResponse.json({
                id: `order_mock_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency,
                is_mock: true
            });
        }

        try {
            const razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });

            const options = {
                amount: Math.round(amount * 100),
                currency,
                receipt: `receipt_${Date.now()}`,
            };

            const order = await razorpay.orders.create(options);
            return NextResponse.json(order);
        } catch (razorpayError: any) {
            console.error('Razorpay API Error:', razorpayError);
            console.warn("Falling back to Mock Mode due to API error.");

            // Fallback to mock if API fails
            return NextResponse.json({
                id: `order_mock_fallback_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency,
                is_mock: true,
                warning: "Razorpay API failed, using mock."
            });
        }
    } catch (error: any) {
        console.error('General Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
