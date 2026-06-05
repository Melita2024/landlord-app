"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Eye, Pencil, Trash2 } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Tenant {
    id: string;
    name: string;
    status: string;
    rentAmount: number;
}

interface Property {
    id: string;
    name: string;
    address: string;
    rentAmount: number;
    description?: string;
    createdAt: string;
    _count: { tenants: number };
    tenants?: Tenant[];
}

function PropertyForm({
    initial,
    onSubmit,
    loading,
    error,
}: {
    initial?: Partial<Property>;
    onSubmit: (data: { name: string; address: string; description: string, rentAmount: number }) => void;
    loading: boolean;
    error: string;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [address, setAddress] = useState(initial?.address ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [rentAmount, setRentAmount] = useState<number | string>(initial?.rentAmount ?? "");

    return (
        <div className="space-y-4 py-2">
            <div className="space-y-2">
                <Label htmlFor="prop-name">Property Name</Label>
                <Input
                    id="prop-name"
                    placeholder="e.g. Sunrise Apartments"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="prop-address">Address</Label>
                <Input
                    id="prop-address"
                    placeholder="e.g. 123 Main St, Cityville"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="prop-rent">Monthly Rent (FCFA)</Label>
                <Input
                    id="prop-rent"
                    type="number"
                    placeholder="e.g. 50000"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="prop-description">Description</Label>
                <Textarea
                    id="prop-description"
                    placeholder="e.g. 3 rooms, 2 toilets, kitchen, living room..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <DialogFooter>
                <Button onClick={() => onSubmit({ name, address, description, rentAmount: Number(rentAmount) })} disabled={loading}>
                    {loading ? "Saving..." : "Save Property"}
                </Button>
            </DialogFooter>
        </div>
    );
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    // Add dialog
    const [addOpen, setAddOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    // View dialog
    const [viewProp, setViewProp] = useState<Property | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    // Edit dialog
    const [editProp, setEditProp] = useState<Property | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Delete
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function fetchProperties() {
        try {
            const res = await fetch("/api/properties");
            if (res.ok) setProperties(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProperties(); }, []);

    async function handleAdd({ name, address, description, rentAmount }: { name: string; address: string; description: string, rentAmount: number }) {
        if (!name.trim() || !address.trim() || !rentAmount) { setAddError("Name, address, and rent amount are required."); return; }
        setAddLoading(true); setAddError("");
        const res = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, description, rentAmount }),
        });
        setAddLoading(false);
        if (res.ok) { setAddOpen(false); fetchProperties(); }
        else { const d = await res.json(); setAddError(d.error || "Failed to create."); }
    }

    async function handleView(id: string) {
        setViewOpen(true); setViewLoading(true);
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) setViewProp(await res.json());
        setViewLoading(false);
    }

    async function handleEdit({ name, address, description, rentAmount }: { name: string; address: string; description: string, rentAmount: number }) {
        if (!editProp) return;
        setEditLoading(true); setEditError("");
        const res = await fetch(`/api/properties/${editProp.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, description, rentAmount }),
        });
        setEditLoading(false);
        if (res.ok) { setEditOpen(false); setEditProp(null); fetchProperties(); }
        else { const d = await res.json(); setEditError(d.error || "Failed to update."); }
    }

    async function handleDelete() {
        if (!deleteId) return;
        setDeleteLoading(true);
        await fetch(`/api/properties/${deleteId}`, { method: "DELETE" });
        setDeleteLoading(false);
        setDeleteId(null);
        fetchProperties();
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Property</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Property</DialogTitle>
                            <DialogDescription>Enter the details for the new property.</DialogDescription>
                        </DialogHeader>
                        <PropertyForm onSubmit={handleAdd} loading={addLoading} error={addError} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>All Properties</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Tenants</TableHead>
                                    <TableHead>Rent Amount</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                                ) : properties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Building2 className="h-8 w-8" />
                                                <p>No properties yet. Add your first one!</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    properties.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell>{p.address}</TableCell>
                                            <TableCell>{p._count?.tenants ?? 0}</TableCell>
                                            <TableCell>{p.rentAmount ? p.rentAmount.toLocaleString() + " FCFA" : "Not Set"}</TableCell>
                                            <TableCell>{format(new Date(p.createdAt), "PPP")}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* View */}
                                                    <Button variant="ghost" size="sm" onClick={() => handleView(p.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {/* Edit */}
                                                    <Button variant="ghost" size="sm" onClick={() => { setEditProp(p); setEditOpen(true); }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {/* Delete */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(p.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete <strong>{p.name}</strong>? This cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDelete}
                                                                    disabled={deleteLoading}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    {deleteLoading ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{viewProp?.name ?? "Property Details"}</DialogTitle>
                        <DialogDescription>{viewProp?.address}</DialogDescription>
                    </DialogHeader>
                    {viewLoading ? (
                        <p className="text-muted-foreground py-4 text-center">Loading...</p>
                    ) : viewProp ? (
                        <div className="space-y-4">
                            {viewProp.description && (
                                <div>
                                    <p className="text-sm font-semibold mb-1">Description</p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{viewProp.description}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold mb-2">Tenants ({viewProp._count?.tenants ?? 0})</p>
                                {viewProp.tenants && viewProp.tenants.length > 0 ? (
                                    <div className="space-y-2">
                                        {viewProp.tenants.map((t) => (
                                            <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                                <span>{t.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{t.rentAmount} FCFA/mo</span>
                                                    <Badge variant={t.status === "ACTIVE" ? "default" : "secondary"}>{t.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No tenants assigned yet.</p>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Added {format(new Date(viewProp.createdAt), "PPPp")}
                            </p>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditProp(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Property</DialogTitle>
                        <DialogDescription>Update the property details below.</DialogDescription>
                    </DialogHeader>
                    {editProp && (
                        <PropertyForm
                            initial={editProp}
                            onSubmit={handleEdit}
                            loading={editLoading}
                            error={editError}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
