import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "LANDLORD") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (status !== "APPROVED" && status !== "REJECTED") {
            return new NextResponse("Invalid status", { status: 400 });
        }

        const user = await (prisma.user as any).update({
            where: {
                id,
            },
            data: {
                status,
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[APPROVALS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
