"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Payment {
    id: string;
    amount: number;
    date: string;
    type: string;
    method: string;
    status: string;
    tenant: {
        name: string;
    };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPayments() {
            try {
                const res = await fetch("/api/payments");
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (error) {
                console.error("Failed to fetch payments", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPayments();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
                <Button asChild>
                    <Link href="/payments/new">
                        <Plus className="mr-2 h-4 w-4" /> Record Payment
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No payments recorded.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(new Date(payment.date), "PPP")}</TableCell>
                                                <TableCell className="font-medium">
                                                    {payment.tenant?.name || "Unknown"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="capitalize">{payment.type.toLowerCase()}</span>
                                                </TableCell>
                                                <TableCell>{payment.method}</TableCell>
                                                <TableCell>{payment.amount} FCFA</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${payment.status === "COMPLETED"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : payment.status === "FAILED"
                                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                            }`}
                                                    >
                                                        {payment.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
