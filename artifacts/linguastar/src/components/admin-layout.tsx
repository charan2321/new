import React from "react";
import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, BookOpen, Users, LogOut, ArrowLeft } from "lucide-react";
import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: roleData, isLoading } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() }});
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && (!roleData || !roleData.isAdmin)) {
      setLocation("/dashboard");
    }
  }, [isLoading, roleData, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!roleData || !roleData.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-muted/20">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/books", label: "Books", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-border bg-background flex flex-col h-[100dvh] sticky top-0">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-md">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg leading-tight">Admin</h2>
          <p className="text-xs text-muted-foreground">Linguastar OS</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        
        <div className="pt-8 pb-2">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storefront</p>
        </div>
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Button>
        </Link>
      </nav>
      
      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate w-full text-left">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground truncate w-full text-left">Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
