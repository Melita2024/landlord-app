import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { tenantSchema } from "@/lib/validations/tenant";

export async function GET() {
    try {
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: "desc" },
            include: { property: true },
        });
        return NextResponse.json(tenants);
    } catch (error) {
        console.error("[TENANTS_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = tenantSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid data", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, phone, propertyId, leaseStart, leaseEnd, rentAmount } = result.data;

        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 400 });
        }

        const tenant = await prisma.tenant.create({
            data: {
                name,
                email,
                phone,
                propertyId,
                leaseStart: new Date(leaseStart),
                leaseEnd: leaseEnd ? new Date(leaseEnd) : null,
                rentAmount,
            },
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("[TENANTS_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
