import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LandlordDashboard } from "@/components/dashboard/LandlordDashboard";
import { TenantDashboard } from "@/components/dashboard/TenantDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "TENANT") {
    if (session.user.status === "PENDING") {
      redirect("/approval");
    }

    const tenantProfile = await (prisma.tenant as any).findFirst({
      where: { userId: session.user.id }
    });

    if (!tenantProfile) {
      redirect("/select-property");
    }

    return <TenantDashboard tenantId={tenantProfile.id} />;
  }

  // Default to Landlord/Admin
  return <LandlordDashboard />;
}
