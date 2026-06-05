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

interface Invoice {
    id: string;
    amount: number;
    dueDate: string;
    type: string;
    status: string;
    tenant: {
        name: string;
    };
}

export default function WaterBillsPage() {
    const [bills, setBills] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBills() {
            try {
                const res = await fetch("/api/invoices?type=WATER");
                if (res.ok) {
                    const data = await res.json();
                    setBills(data);
                }
            } catch (error) {
                console.error("Failed to fetch water bills", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBills();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Water Bills</h2>
                <Button asChild>
                    <Link href="/water-bills/new">
                        <Plus className="mr-2 h-4 w-4" /> Record Reading / Bill
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Water Bill History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bills.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                No water bills found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bills.map((bill) => (
                                            <TableRow key={bill.id}>
                                                <TableCell>{format(new Date(bill.dueDate), "PPP")}</TableCell>
                                                <TableCell className="font-medium">
                                                    {bill.tenant?.name || "Unknown"}
                                                </TableCell>
                                                <TableCell>{bill.amount} FCFA</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bill.status === "PAID"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : bill.status === "OVERDUE"
                                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                            }`}
                                                    >
                                                        {bill.status}
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
