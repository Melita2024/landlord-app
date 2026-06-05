"use client";

import { UserNav } from "./UserNav";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                {/* Mobile Logo or Title could go here if Sidebar is hidden */}
                <div className="md:hidden font-bold text-xl ml-2">LandlordApp</div>
                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </div>
    );
}
