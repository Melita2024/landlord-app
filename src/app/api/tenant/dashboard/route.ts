import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TENANT") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const tenant = await (prisma.tenant as any).findFirst({
            where: { userId: session.user.id },
            include: {
                property: true,
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }
            }
        });

        if (!tenant) {
            return new NextResponse("Tenant profile not found", { status: 404 });
        }

        return NextResponse.json({
            id: tenant.id,
            propertyName: tenant.property.name,
            rentAmount: tenant.rentAmount,
            balance: tenant.balance,
            leaseStart: tenant.leaseStart,
            recentPayments: tenant.payments.map((p: any) => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error("[TENANT_DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
