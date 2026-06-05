import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, notificationsEnabled } = body;

        if (!name || !email) {
            return new NextResponse("Name and email are required", { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return NextResponse.json(
                { error: "Email is already taken by another user" },
                { status: 409 }
            );
        }

        const dataToUpdate: any = { name, email };
        if (notificationsEnabled !== undefined) {
            dataToUpdate.notificationsEnabled = notificationsEnabled;
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            notificationsEnabled: user.notificationsEnabled,
        });
    } catch (error) {
        console.error("[USER_PROFILE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
