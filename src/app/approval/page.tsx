"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function ApprovalPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.status === "APPROVED") {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading" || session?.user?.status === "APPROVED") {
        return <div className="flex h-screen w-full items-center justify-center p-8">Loading...</div>;
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4 absolute top-0 left-0 z-50">
            <Card className="w-full max-w-md shadow-lg border-amber-200 text-center">
                <CardHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-amber-100 p-4 inline-flex">
                            <Clock className="h-10 w-10 text-amber-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Approval Pending</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Your account has been created successfully, but it requires landlord approval before you can access the tenant portal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <p className="text-sm">
                        Please contact your landlord to activate your account. Once approved, you can refresh this page to continue.
                    </p>
                    <Button variant="outline" className="w-full mt-4" onClick={() => signOut({ callbackUrl: "/login" })}>
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
