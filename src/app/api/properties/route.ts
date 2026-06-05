import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { tenants: true } } },
        });
        return NextResponse.json(properties);
    } catch (error) {
        console.error("[PROPERTIES_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, address, description, rentAmount } = body;

        if (!name || !address) {
            return NextResponse.json(
                { error: "Name and address are required" },
                { status: 400 }
            );
        }

        const property = await (prisma.property as any).create({
            data: {
                name,
                address,
                description,
                rentAmount: rentAmount ? parseFloat(rentAmount) : 0
            },
        });

        return NextResponse.json(property);
    } catch (error) {
        console.error("[PROPERTIES_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
