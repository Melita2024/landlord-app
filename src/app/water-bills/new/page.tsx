"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const waterBillSchema = z.object({
    tenantId: z.string().min(1, "Tenant is required"),
    amount: z.coerce.number().min(0, "Amount must be positive"),
    dueDate: z.string().min(1, "Due date is required"),
});

type WaterBillFormValues = z.infer<typeof waterBillSchema>;

interface Tenant {
    id: string;
    name: string;
}

export default function NewWaterBillPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);

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
            }
        }
        fetchTenants();
    }, []);

    const form = useForm({
        resolver: zodResolver(waterBillSchema) as any,
        defaultValues: {
            tenantId: "",
            amount: 0,
            dueDate: "",
        },
    });

    async function onSubmit(data: WaterBillFormValues) {
        setLoading(true);
        try {
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    type: "WATER",
                    status: "PENDING",
                }),
            });

            if (!res.ok) {
                throw new Error("Something went wrong");
            }

            router.push("/water-bills");
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Create Water Bill</h3>
                <p className="text-sm text-muted-foreground">
                    Record water usage and generate a bill for a tenant.
                </p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="tenantId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tenant</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a tenant" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {tenants.map((tenant) => (
                                                        <SelectItem key={tenant.id} value={tenant.id}>
                                                            {tenant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (FCFA)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Bill"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
