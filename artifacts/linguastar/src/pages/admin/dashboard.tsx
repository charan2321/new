import { Link, useLocation } from "wouter";
import { Show } from "@clerk/react";
import {
  useGetAnalyticsOverview, getGetAnalyticsOverviewQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useGetMyRole, getGetMyRoleQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { DollarSign, Users, BookOpen, ShoppingCart, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

function AdminDashboardContent() {
  const [, setLocation] = useLocation();

  const { data: role, isLoading: isLoadingRole } = useGetMyRole({
    query: { queryKey: getGetMyRoleQueryKey() },
  });
  const { data: overview, isLoading: isLoadingOverview } = useGetAnalyticsOverview({
    query: { queryKey: getGetAnalyticsOverviewQueryKey(), enabled: role?.isAdmin },
  });
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey(), enabled: role?.isAdmin },
  });

  if (isLoadingRole) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!role?.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  const statCards = [
    { icon: DollarSign, label: "Total Revenue", value: `$${(overview?.totalRevenue ?? 0).toFixed(2)}`, sub: `$${(overview?.revenueThisMonth ?? 0).toFixed(2)} this month`, color: "text-green-600" },
    { icon: Users, label: "Total Users", value: overview?.totalUsers ?? 0, sub: `+${overview?.newUsersThisMonth ?? 0} this month`, color: "text-blue-600" },
    { icon: BookOpen, label: "Total Books", value: overview?.totalBooks ?? 0, sub: "In catalog", color: "text-primary" },
    { icon: ShoppingCart, label: "Total Purchases", value: overview?.totalPurchases ?? 0, sub: "Completed orders", color: "text-amber-600" },
  ];

  const topBooksChartData = overview?.topBooks?.map((b) => ({
    name: b.title.length > 18 ? b.title.slice(0, 18) + "…" : b.title,
    sales: b.salesCount,
    revenue: parseFloat(b.revenue.toFixed(2)),
  })) ?? [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">Platform performance at a glance</p>
      </div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, sub, color }) => (
          <motion.div key={label} variants={item}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <div className={`p-2 rounded-lg bg-muted ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                {isLoadingOverview ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Books Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top Books by Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOverview ? (
                <Skeleton className="h-48 w-full" />
              ) : topBooksChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topBooksChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No sales data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activity.slice(0, 10).map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 mt-0.5 ${
                          a.type === "purchase" ? "border-green-500/30 text-green-600 bg-green-50" :
                          a.type === "signup" ? "border-blue-500/30 text-blue-600 bg-blue-50" :
                          "border-border"
                        }`}
                      >
                        {a.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  return (
    <>
      <Show when="signed-in">
        <AdminDashboardContent />
      </Show>
      <Show when="signed-out">
        {(() => { setLocation("/"); return null; })()}
      </Show>
    </>
  );
}
