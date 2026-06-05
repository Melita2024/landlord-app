"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Home,
    CreditCard,
    Settings,
    LogOut,
    Droplets,
    UserCheck,
} from "lucide-react";
import { useSession } from "next-auth/react";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Properties",
        icon: Home,
        href: "/properties",
    },
    {
        label: "Tenants",
        icon: Users,
        href: "/tenants",
    },
    {
        label: "Payments",
        icon: CreditCard,
        href: "/payments",
    },
    {
        label: "Water Bills",
        icon: Droplets,
        href: "/water-bills",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        roles: ["LANDLORD", "TENANT", "ADMIN"],
    },
];

const landlordOnlyRoutes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Properties",
        icon: Home,
        href: "/properties",
    },
    {
        label: "Tenants",
        icon: Users,
        href: "/tenants",
    },
    {
        label: "Pending Approvals",
        icon: UserCheck,
        href: "/approvals",
    },
    {
        label: "Payments",
        icon: CreditCard,
        href: "/payments",
    },
    {
        label: "Water Bills",
        icon: Droplets,
        href: "/water-bills",
    },
];

const tenantOnlyRoutes = [
    {
        label: "Tenant Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "My Payments",
        icon: CreditCard,
        href: "/tenant/payments",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const role = session?.user?.role || "TENANT";

    const mainRoutes = role === "LANDLORD" || role === "ADMIN" ? landlordOnlyRoutes : tenantOnlyRoutes;
    const allRoutes = [...mainRoutes, ...routes.filter((r) => r.roles?.includes(role))];

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">Landlord<span className="text-primary">App</span></h1>
                </Link>
                <div className="space-y-1">
                    {allRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
