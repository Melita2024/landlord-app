import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { paymentSchema } from "@/lib/validations/payment";
import { sendPaymentReceipt } from "@/lib/whatsapp";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const tenant = await (prisma.tenant as any).findFirst({
            where: { userId: session.user.id }
        });

        if (!tenant) return new NextResponse("Tenant not found", { status: 404 });

        const payments = await prisma.payment.findMany({
            where: { tenantId: tenant.id },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(payments);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const tenant: any = await (prisma.tenant as any).findFirst({
            where: { userId: session.user.id }
        });

        if (!tenant) return new NextResponse("Tenant not found", { status: 404 });

        const body = await req.json();
        const result = paymentSchema.safeParse({ ...body, tenantId: tenant.id, status: "COMPLETED" });

        if (!result.success) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        const { amount, date, type, method, reference, status } = result.data;

        const payment = await prisma.payment.create({
            data: {
                tenantId: tenant.id,
                amount,
                date: new Date(date),
                type,
                method,
                reference,
                status,
            },
        });

        if (tenant.phone) {
            try {
                await sendPaymentReceipt(tenant.phone, amount, new Date(date).toLocaleDateString(), tenant.name);
            } catch (e) {
                console.error("Failed to send WhatsApp receipt", e);
            }
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error("[TENANT_PAYMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
