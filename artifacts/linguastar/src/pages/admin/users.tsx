import { useState } from "react";
import { useLocation } from "wouter";
import { Show } from "@clerk/react";
import {
  useAdminListUsers, getAdminListUsersQueryKey,
  useGetMyRole, getGetMyRoleQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, ShoppingCart, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

function AdminUsersContent() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: role } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });
  const { data: users, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey(), enabled: role?.isAdmin },
  });

  if (!role?.isAdmin) { setLocation("/dashboard"); return null; }

  const filtered = users?.filter((u) =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">{users?.length ?? 0} registered users</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {
                icon: Users,
                label: "Total Users",
                value: users?.length ?? 0,
              },
              {
                icon: ShoppingCart,
                label: "Total Purchases",
                value: users?.reduce((s, u) => s + u.purchaseCount, 0) ?? 0,
              },
              {
                icon: DollarSign,
                label: "Total Revenue",
                value: `$${(users?.reduce((s, u) => s + u.totalSpent, 0) ?? 0).toFixed(2)}`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((user, i) => {
              const initials = (user.name ?? user.email)[0].toUpperCase();
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{user.name ?? user.email}</span>
                      {user.role === "admin" && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/30 text-primary bg-primary/5">
                          Admin
                        </Badge>
                      )}
                    </div>
                    {user.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{user.purchaseCount} books</p>
                    <p className="text-xs text-muted-foreground">${user.totalSpent.toFixed(2)} spent</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  return (
    <>
      <Show when="signed-in"><AdminUsersContent /></Show>
      <Show when="signed-out">{(() => { setLocation("/"); return null; })()}</Show>
    </>
  );
}
