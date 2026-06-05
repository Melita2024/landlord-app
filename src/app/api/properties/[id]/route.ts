import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                _count: { select: { tenants: true } },
                tenants: {
                    select: { id: true, name: true, status: true, rentAmount: true },
                },
            },
        });

        if (!property) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTY_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { name, address, description, rentAmount } = body;

        const property = await prisma.property.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(address && { address }),
                description: description ?? null,
                ...(rentAmount !== undefined && { rentAmount: parseFloat(rentAmount) }),
            },
        });

        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTY_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.property.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PROPERTY_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
