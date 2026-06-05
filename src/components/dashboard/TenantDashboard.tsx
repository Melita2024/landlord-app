"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Banknote, CreditCard, History, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantDashboardData {
    id: string;
    propertyName: string;
    rentAmount: number;
    balance: number;
    leaseStart: string;
    recentPayments: {
        id: string;
        amount: number;
        status: string;
        createdAt: string;
    }[];
}

export function TenantDashboard({ tenantId }: { tenantId: string }) {
    const [data, setData] = useState<TenantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/tenant/dashboard`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch tenant dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [tenantId]);

    if (loading) {
        return <div className="p-8 flex justify-center items-center h-full">Loading your portal...</div>;
    }

    if (!data) {
        return <div className="p-8 flex justify-center items-center h-full">Failed to load portal data. Please try again later.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tenant Portal</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Welcome back! Here is an overview of your lease and recent payments.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <Banknote className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${data.balance > 0 ? "text-red-500" : "text-green-600"}`}>
                            {data.balance.toLocaleString()} FCFA
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.balance > 0 ? "Payment is due" : "All caught up"}
                        </p>
                        <Button className="w-full mt-4" onClick={() => window.location.href = "/tenant/payments"}>
                            Make a Payment
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Apartment</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">{data.propertyName}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Rent: {data.rentAmount.toLocaleString()} FCFA / month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2 mt-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = "/tenant/payments"}>
                            <History className="mr-2 h-4 w-4" />
                            Payment History
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest rent and water bill payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.recentPayments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent payments found.</p>
                        ) : (
                            data.recentPayments.map((payment) => (
                                <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0" key={payment.id}>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Status: {payment.status}
                                        </p>
                                    </div>
                                    <div className="font-medium text-green-600">
                                        +{payment.amount.toLocaleString()} FCFA
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
