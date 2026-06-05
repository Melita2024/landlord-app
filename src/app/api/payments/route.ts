import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { paymentSchema } from "@/lib/validations/payment";
import { sendPaymentReceipt } from "@/lib/whatsapp";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const payments = await prisma.payment.findMany({
            orderBy: {
                date: "desc",
            },
            include: {
                tenant: true,
            },
        });

        return NextResponse.json(payments);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const result = paymentSchema.safeParse(body);

        if (!result.success) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        const { tenantId, amount, date, type, method, reference, status } = result.data;

        const payment = await prisma.payment.create({
            data: {
                tenantId,
                amount,
                date: new Date(date),
                type,
                method,
                reference,
                status,
            },
        });

        // Update tenant balance (simple logic for now)
        // If payment is completed and is RENT, maybe decrease balance? 
        // Or balance is calculated from Invoices - Payments.
        // For now, let's just record payment.

        // Send WhatsApp Receipt
        try {
            const tenant = await prisma.tenant.findUnique({
                where: { id: tenantId },
            });

            if (tenant && tenant.phone && type === "RENT") {
                await sendPaymentReceipt(tenant.phone, amount, new Date(date).toLocaleDateString(), tenant.name);
            }
        } catch (e) {
            console.error("Failed to send WhatsApp receipt", e);
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.log("[PAYMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
