"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Home,
    CreditCard,
    Menu,
    Droplets,
} from "lucide-react";

const routes = [
    {
        label: "Home",
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
        label: "Water",
        icon: Droplets,
        href: "/water-bills",
    },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-600 md:hidden">
            <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-5 group hover:bg-gray-50 dark:hover:bg-gray-800",
                            pathname === route.href ? "text-primary" : "text-gray-500 dark:text-gray-400"
                        )}
                    >
                        <route.icon className="w-5 h-5 mb-1 group-hover:text-primary" />
                        <span className="text-xs group-hover:text-primary">{route.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
