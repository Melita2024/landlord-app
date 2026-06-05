import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const pendingTenants = await (prisma.user as any).findMany({
            where: {
                role: "TENANT",
                status: "PENDING",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        return NextResponse.json(pendingTenants);
    } catch (error) {
        console.error("[APPROVALS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
