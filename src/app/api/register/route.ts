import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as z from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(9, "Phone number must be at least 9 characters").optional(),
    role: z.enum(["LANDLORD", "TENANT"]).default("TENANT"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid data", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, phone, role } = result.data;

        const status = role === "TENANT" ? "PENDING" : "APPROVED";

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await (prisma.user as any).create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role,
                status,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("[REGISTER_POST]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
