"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PendingTenant {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
}

export default function ApprovalsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tenants, setTenants] = useState<PendingTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "LANDLORD")) {
            router.push("/");
        } else if (status === "authenticated") {
            fetchPendingTenants();
        }
    }, [session, status, router]);

    async function fetchPendingTenants() {
        try {
            const res = await fetch("/api/approvals");
            if (res.ok) {
                const data = await res.json();
                setTenants(data);
            }
        } catch (error) {
            console.error("Failed to fetch pending tenants", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(userId: string) {
        setProcessingId(userId);
        try {
            const res = await fetch(`/api/approvals/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" }),
            });

            if (res.ok) {
                // Remove the approved tenant from the list
                setTenants((prev) => prev.filter((t) => t.id !== userId));
            }
        } catch (error) {
            console.error("Failed to approve tenant", error);
        } finally {
            setProcessingId(null);
        }
    }

    if (loading || status === "loading") {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Pending Approvals</h3>
                <p className="text-sm text-muted-foreground">
                    Review and approve new tenant registrations.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Awaiting Approval</CardTitle>
                    <CardDescription>
                        Tenants who have registered and are waiting to access their portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {tenants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
                            <CheckCircle className="h-10 w-10 text-green-500 mb-4" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-sm text-muted-foreground">There are no pending tenant registrations.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>WhatsApp</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.map((tenant) => (
                                        <TableRow key={tenant.id}>
                                            <TableCell className="font-medium">{tenant.name}</TableCell>
                                            <TableCell>{tenant.email}</TableCell>
                                            <TableCell>{tenant.phone || "N/A"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-muted-foreground">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    {new Date(tenant.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    disabled={processingId === tenant.id}
                                                    onClick={() => handleApprove(tenant.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    {processingId === tenant.id ? "Approving..." : "Approve"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
