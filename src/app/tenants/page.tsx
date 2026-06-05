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

interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    property: {
        name: string;
    };
    status: string;
    rentAmount: number;
    balance: number;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTenants() {
            try {
                const res = await fetch("/api/tenants");
                if (res.ok) {
                    const data = await res.json();
                    setTenants(data);
                }
            } catch (error) {
                console.error("Failed to fetch tenants", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTenants();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
                <Button asChild>
                    <Link href="/tenants/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Tenant
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Rent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenants.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No tenants found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tenants.map((tenant) => (
                                            <TableRow key={tenant.id}>
                                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                                <TableCell>{tenant.property?.name || "N/A"}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span>{tenant.email}</span>
                                                        <span className="text-muted-foreground">
                                                            {tenant.phone}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{tenant.rentAmount} FCFA</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tenant.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                            }`}
                                                    >
                                                        {tenant.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/tenants/${tenant.id}`}>View</Link>
                                                    </Button>
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
