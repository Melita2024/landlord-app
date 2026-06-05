import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const invoiceSchema = z.object({
    tenantId: z.string().min(1, "Tenant is required"),
    amount: z.coerce.number().min(0),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }),
    type: z.enum(["RENT", "WATER", "OTHER"]),
    status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PENDING"),
});

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    try {
        const invoices = await prisma.invoice.findMany({
            where: type ? { type } : undefined,
            orderBy: {
                dueDate: "desc",
            },
            include: {
                tenant: true,
            },
        });

        return NextResponse.json(invoices);
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
        const result = invoiceSchema.safeParse(body);

        if (!result.success) {
            return new NextResponse("Invalid data", { status: 400 });
        }

        const { tenantId, amount, dueDate, type, status } = result.data;

        const invoice = await prisma.invoice.create({
            data: {
                tenantId,
                amount,
                dueDate: new Date(dueDate),
                type,
                status,
            },
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.log("[INVOICES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
