import { Link, useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import {
  useListPurchases, getListPurchasesQueryKey,
  useListReadingProgress, getListReadingProgressQueryKey,
  useGetMe, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock, TrendingUp, User2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function DashboardContent() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const { data: purchases, isLoading: isLoadingPurchases } = useListPurchases({
    query: { queryKey: getListPurchasesQueryKey() },
  });
  const { data: progressList, isLoading: isLoadingProgress } = useListReadingProgress({
    query: { queryKey: getListReadingProgressQueryKey() },
  });

  if (!user) return null;

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.primaryEmailAddress?.emailAddress[0].toUpperCase() || "U";

  const inProgress = progressList?.filter((p) => p.percentComplete < 100 && p.percentComplete > 0) ?? [];
  const completed = progressList?.filter((p) => p.percentComplete >= 100) ?? [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl font-bold">
              Welcome back, {user.firstName || user.primaryEmailAddress?.emailAddress.split("@")[0]}
            </h1>
            <p className="text-muted-foreground text-sm">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: BookOpen, label: "Books Owned", value: purchases?.length ?? 0 },
            { icon: TrendingUp, label: "In Progress", value: inProgress.length },
            { icon: Clock, label: "Completed", value: completed.length },
            { icon: User2, label: "Member Since", value: me?.createdAt ? new Date(me.createdAt).getFullYear() : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <motion.div key={label} variants={item}>
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue reading */}
        {(isLoadingProgress ? true : inProgress.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold">Continue Reading</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {isLoadingProgress
                ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                : inProgress.map((prog) => (
                    <Link key={prog.bookId} href={`/reader/${prog.bookId}`}>
                      <Card className="border-border hover:border-primary/40 transition-colors cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex gap-4 items-start">
                            <div className="h-16 w-12 rounded bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                              <BookOpen className="h-5 w-5 text-primary/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                {prog.book.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mb-3">{prog.book.author}</p>
                              <Progress value={prog.percentComplete} className="h-1.5 mb-1" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Page {prog.currentPage} of {prog.totalPages}</span>
                                <span>{Math.round(prog.percentComplete)}%</span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>
          </motion.section>
        )}

        {/* Library */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold">My Library</h2>
            <Link href="/store">
              <Button variant="outline" size="sm">Browse More</Button>
            </Link>
          </div>

          {isLoadingPurchases ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : purchases && purchases.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchases.map((purchase, i) => {
                const prog = progressList?.find((p) => p.bookId === purchase.bookId);
                return (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/reader/${purchase.bookId}`}>
                      <Card className="border-border hover:border-primary/40 transition-all cursor-pointer group hover:shadow-md">
                        <div className="aspect-[3/2] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-border overflow-hidden rounded-t-xl">
                          {purchase.book.coverUrl ? (
                            <img src={purchase.book.coverUrl} alt={purchase.book.title} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="h-10 w-10 text-primary/40" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {purchase.book.title}
                            </h3>
                            <Badge variant="outline" className="text-xs shrink-0">{purchase.book.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{purchase.book.author}</p>
                          {prog && (
                            <>
                              <Progress value={prog.percentComplete} className="h-1 mb-1" />
                              <p className="text-xs text-muted-foreground">{Math.round(prog.percentComplete)}% complete</p>
                            </>
                          )}
                          {!prog && (
                            <p className="text-xs text-muted-foreground">Not started</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed border-border">
              <CardContent className="py-16 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Your library is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Browse our curated collection of language learning books.
                </p>
                <Link href="/store">
                  <Button>Browse Library</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-in">
        <DashboardContent />
      </Show>
      <Show when="signed-out">
        {(() => { setLocation("/"); return null; })()}
      </Show>
    </>
  );
}
