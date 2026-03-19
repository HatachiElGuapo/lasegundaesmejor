import DashboardNav from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      <DashboardNav />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
