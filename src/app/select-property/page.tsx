"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Banknote, MapPin } from "lucide-react";

interface Property {
    id: string;
    name: string;
    address: string;
    rentAmount: number;
    description: string | null;
}

export default function SelectPropertyPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectingId, setSelectingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProperties() {
            try {
                const res = await fetch("/api/properties");
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);
                }
            } catch (error) {
                console.error("Failed to fetch properties", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProperties();
    }, []);

    async function handleSelectProperty(propertyId: string) {
        setSelectingId(propertyId);
        try {
            const res = await fetch("/api/select-property", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                console.error("Failed to claim property");
                setSelectingId(null);
            }
        } catch (error) {
            console.error(error);
            setSelectingId(null);
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center items-center h-screen bg-muted/40">Loading available properties...</div>;
    }

    return (
        <div className="flex flex-col h-screen w-full items-center bg-muted/40 p-4 absolute top-0 left-0 z-50 overflow-y-auto pt-16">
            <div className="w-full max-w-4xl space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Select Your Apartment</h1>
                    <p className="text-muted-foreground">
                        Your account has been approved! Please select the apartment you are renting to continue.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                        <Card key={property.id} className="flex flex-col h-full border-primary/20 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="rounded-full bg-primary/10 p-2 inline-flex">
                                        <Home className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant="outline" className="font-semibold px-2 py-1">
                                        {property.rentAmount.toLocaleString()} FCFA
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">{property.name}</CardTitle>
                                <CardDescription className="flex items-start mt-2">
                                    <MapPin className="h-4 w-4 mr-1 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{property.address}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {property.description || "No description provided."}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full font-medium"
                                    onClick={() => handleSelectProperty(property.id)}
                                    disabled={selectingId !== null}
                                >
                                    {selectingId === property.id ? "Assigning..." : "Select Apartment"}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {properties.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No properties found. Please ask your landlord to add properties to the system.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 ${className}`}>
            {children}
        </span>
    );
}
