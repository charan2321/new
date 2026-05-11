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
import { BookOpen, LogOut, LayoutDashboard, Settings, UserCircle } from "lucide-react";
import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const [location] = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Linguastar" className="h-8 w-8" />
            <span className="font-serif font-bold text-xl tracking-tight">Linguastar</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/store" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/store' ? 'text-primary' : 'text-muted-foreground'}`}>
              Browse Library
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <UserMenu />
          </Show>
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() }});
  
  if (!user) return null;
  
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.primaryEmailAddress?.emailAddress[0].toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer w-full flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Library</span>
          </Link>
        </DropdownMenuItem>
        
        {roleData?.isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer w-full flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4 inline-flex">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Linguastar" className="h-6 w-6 grayscale" />
            <span className="font-serif font-bold text-lg text-muted-foreground tracking-tight">Linguastar</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm">
            Curated digital books for serious language learners. Elevate your fluency with beautifully designed reading experiences.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/store" className="hover:text-primary transition-colors">Browse Library</Link></li>
            <li><Link href="/sign-in" className="hover:text-primary transition-colors">Sign In</Link></li>
            <li><Link href="/sign-up" className="hover:text-primary transition-colors">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Linguastar. All rights reserved.</p>
        <p>Designed for the ambitious learner.</p>
      </div>
    </footer>
  );
}
