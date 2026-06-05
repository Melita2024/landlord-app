"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Banknote, Droplets, History } from "lucide-react";

interface Payment {
    id: string;
    amount: number;
    date: string;
    type: string;
    method: string;
    status: string;
    reference?: string;
}

interface TenantInfo {
    id: string;
    propertyName: string;
    rentAmount: number;
    balance: number;
}

export default function TenantPaymentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [type, setType] = useState("RENT");
    const [method, setMethod] = useState("CASH");
    const [reference, setReference] = useState("");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && session?.user?.role !== "TENANT") {
            router.push("/");
        }
    }, [session, status, router]);

    useEffect(() => {
        if (status !== "authenticated" || session?.user?.role !== "TENANT") return;
        fetchData();
    }, [status, session]);

    async function fetchData() {
        setLoading(true);
        try {
            const [paymentsRes, dashboardRes] = await Promise.all([
                fetch("/api/tenant/payments"),
                fetch("/api/tenant/dashboard"),
            ]);

            if (paymentsRes.ok) {
                const data = await paymentsRes.json();
                setPayments(data);
            }
            if (dashboardRes.ok) {
                const data = await dashboardRes.json();
                setTenantInfo({
                    id: data.id,
                    propertyName: data.propertyName,
                    rentAmount: data.rentAmount,
                    balance: data.balance,
                });
                // Pre-fill amount with rent amount when type is RENT
                setAmount(String(data.rentAmount));
            }
        } catch (e) {
            console.error("Failed to load payment data", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setFormError("Please enter a valid amount.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/tenant/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: tenantInfo?.id, // API will override with session data
                    amount: Number(amount),
                    date,
                    type,
                    method,
                    reference,
                    status: "COMPLETED",
                }),
            });

            if (res.ok) {
                setDialogOpen(false);
                setReference("");
                fetchData();
            } else {
                const data = await res.json();
                setFormError(data.message || "Payment failed. Please try again.");
            }
        } catch (e) {
            setFormError("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    }

    // Auto-fill amount when type changes
    function handleTypeChange(val: string) {
        setType(val);
        if (val === "RENT" && tenantInfo) {
            setAmount(String(tenantInfo.rentAmount));
        } else {
            setAmount("");
        }
    }

    const statusColors: Record<string, string> = {
        COMPLETED: "bg-green-100 text-green-800 border-green-200",
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        FAILED: "bg-red-100 text-red-800 border-red-200",
    };

    const typeIcons: Record<string, React.ReactNode> = {
        RENT: <Banknote className="h-4 w-4 text-blue-500" />,
        WATER: <Droplets className="h-4 w-4 text-cyan-500" />,
        OTHER: <CreditCard className="h-4 w-4 text-gray-500" />,
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full p-8">Loading payment history...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Payments</h2>
                    {tenantInfo && (
                        <p className="text-sm text-muted-foreground mt-1">
                            Apartment: <span className="font-medium">{tenantInfo.propertyName}</span> &nbsp;·&nbsp;
                            Rent: <span className="font-medium">{tenantInfo.rentAmount.toLocaleString()} FCFA/month</span>
                        </p>
                    )}
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Make a Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record a Payment</DialogTitle>
                            <DialogDescription>
                                Enter your payment details below. A receipt will be sent to your WhatsApp.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            {formError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                                    {formError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="pay-type">Payment Type</Label>
                                <Select value={type} onValueChange={handleTypeChange}>
                                    <SelectTrigger id="pay-type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="RENT">Rent</SelectItem>
                                        <SelectItem value="WATER">Water Bill</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pay-amount">Amount (FCFA)</Label>
                                <Input
                                    id="pay-amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min={1}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pay-date">Payment Date</Label>
                                <Input
                                    id="pay-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pay-method">Payment Method</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger id="pay-method">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pay-ref">Reference (Optional)</Label>
                                <Input
                                    id="pay-ref"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g. Transaction ID"
                                />
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={submitting}>
                                {submitting ? "Submitting..." : "Confirm Payment"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Balance Card */}
            {tenantInfo && (
                <Card className={`border ${tenantInfo.balance > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                            <p className={`text-2xl font-bold ${tenantInfo.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                                {tenantInfo.balance.toLocaleString()} FCFA
                            </p>
                        </div>
                        <div className={`rounded-full p-3 ${tenantInfo.balance > 0 ? "bg-red-100" : "bg-green-100"}`}>
                            <Banknote className={`h-6 w-6 ${tenantInfo.balance > 0 ? "text-red-500" : "text-green-600"}`} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Payment History</CardTitle>
                    </div>
                    <CardDescription>All your recorded rent and water bill payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border rounded-lg bg-muted/20">
                            <CreditCard className="h-8 w-8 mb-3" />
                            <p className="font-medium">No payments yet</p>
                            <p className="text-sm">Your payment history will appear here.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {typeIcons[payment.type] ?? <CreditCard className="h-4 w-4" />}
                                                    <span className="font-medium">{payment.type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {payment.amount.toLocaleString()} FCFA
                                            </TableCell>
                                            <TableCell>
                                                {new Date(payment.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {payment.method.replace(/_/g, " ")}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {payment.reference || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[payment.status] || ""}`}>
                                                    {payment.status}
                                                </span>
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
