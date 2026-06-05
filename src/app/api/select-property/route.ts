import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { propertyId } = body;

        const property = await (prisma.property as any).findUnique({ where: { id: propertyId } });
        if (!property) {
            return new NextResponse("Property not found", { status: 404 });
        }

        const user = await (prisma.user as any).findUnique({ where: { id: session.user.id } });
        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const tenant = await (prisma.tenant as any).create({
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                userId: user.id,
                propertyId: property.id,
                rentAmount: property.rentAmount || 0,
                leaseStart: new Date(),
                status: "ACTIVE",
            }
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("[SELECT_PROPERTY_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
