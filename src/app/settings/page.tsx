"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const { data: session, update } = useSession();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // State for notifications
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // For success dialog
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
    const [error, setError] = useState("");

    // Initialize state with session data
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
            if ((session.user as any).notificationsEnabled !== undefined) {
                setNotificationsEnabled((session.user as any).notificationsEnabled);
            }
        }
    }, [session]);

    const handleSaveConfirm = async () => {
        setError("");
        setIsSaving(true);
        setIsDialogOpen(false); // Close the confirmation dialog

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, notificationsEnabled }),
            });

            if (res.ok) {
                // Update NextAuth session without full reload
                await update({ name, email, notificationsEnabled });

                // Show success dialog
                setIsSuccessDialogOpen(true);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update profile");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update your personal information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="text-sm font-medium text-destructive">{error}</div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            disabled={isSaving || !name || !email || (name === session?.user?.name && email === session?.user?.email && notificationsEnabled === (session?.user as any)?.notificationsEnabled)}
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Preferences</CardTitle>
                        <CardDescription>
                            Configure system-wide settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base" htmlFor="email-notifications">Email Notifications</Label>
                                <div className="text-sm text-muted-foreground">
                                    Receive emails about tenant payments.
                                </div>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={notificationsEnabled}
                                onCheckedChange={setNotificationsEnabled}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to save these changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will update your profile information across the entire application immediately. Your session will be updated without needing to log back in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveConfirm} disabled={isSaving}>
                            Confirm Update
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Success Dialog */}
            <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Profile Updated Successfully!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your profile changes have been saved to the database and your session has been updated.
                            The new name and email will now be visible across the app, including the navigation menu in the corner!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsSuccessDialogOpen(false)}>
                            Done
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
