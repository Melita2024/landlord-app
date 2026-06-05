import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [
            totalProperties,
            totalTenants,
            activeTenants,
            payments,
            recentPayments,
        ] = await Promise.all([
            prisma.property.count(),
            prisma.tenant.count(),
            prisma.tenant.count({ where: { status: "ACTIVE" } }),
            prisma.payment.findMany({
                where: { status: "COMPLETED" },
                select: { amount: true },
            }),
            prisma.payment.findMany({
                take: 5,
                orderBy: { date: "desc" },
                include: { tenant: true },
            }),
        ]);

        const totalRevenue = payments.reduce(
            (acc: number, curr: { amount: number }) => acc + curr.amount,
            0
        );

        return NextResponse.json({
            totalRevenue,
            totalTenants,
            totalProperties,
            activeTenants,
            recentPayments: recentPayments.map((p: any) => ({
                id: p.id,
                name: p.tenant.name,
                email: p.tenant.email,
                amount: p.amount,
                status: p.status,
            })),
        });
    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}
