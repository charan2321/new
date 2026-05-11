import { Link, useLocation } from "wouter";
import { useGetBook, getGetBookQueryKey, useCreatePurchase, useListPurchases, getListPurchasesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Show } from "@clerk/react";
import { ArrowLeft, BookOpen, Star, Globe2, BarChart3, Lock, ShoppingCart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface BookDetailProps {
  id: number;
}

export default function BookDetail({ id }: BookDetailProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: book, isLoading } = useGetBook(id, { query: { enabled: !!id, queryKey: getGetBookQueryKey(id) } });
  const { data: purchases } = useListPurchases({ query: { queryKey: getListPurchasesQueryKey() } });
  const createPurchase = useCreatePurchase();

  const alreadyPurchased = purchases?.some((p) => p.bookId === id && p.status === "completed");

  function handlePurchase() {
    if (!book) return;
    createPurchase.mutate(
      { data: { bookId: book.id, amount: book.price } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPurchasesQueryKey() });
          toast({ title: "Purchase successful!", description: `You now have access to "${book.title}"` });
          setLocation(`/reader/${book.id}`);
        },
        onError: (err: any) => {
          const msg = err?.data?.error ?? "Purchase failed. Please try again.";
          toast({ title: "Purchase failed", description: msg, variant: "destructive" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="h-96 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Book not found</h2>
        <Link href="/store"><Button variant="outline">Back to Store</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/store">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Cover */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-border flex items-center justify-center shadow-xl">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                  <p className="font-serif text-xl font-bold text-foreground/60">{book.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{book.author}</p>
                </div>
              )}
            </div>
            {book.isBestseller && (
              <Badge className="absolute top-4 left-4 bg-amber-500 text-white">Bestseller</Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-xs">{book.category}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{book.level}</Badge>
              </div>
              <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-2">{book.title}</h1>
              <p className="text-muted-foreground text-lg">by {book.author}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(book.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="font-medium">{book.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({book.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">{book.description}</p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Globe2, label: "Language", value: book.language },
                { icon: BarChart3, label: "Level", value: book.level },
                { icon: BookOpen, label: "Pages", value: book.totalPages.toString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-3xl font-bold text-foreground">${book.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>DRM protected · No downloads</span>
              </div>
            </div>

            <Show when="signed-in">
              {alreadyPurchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>You own this book</span>
                  </div>
                  <Link href={`/reader/${book.id}`}>
                    <Button size="lg" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" /> Continue Reading
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={createPurchase.isPending}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {createPurchase.isPending ? "Processing..." : `Purchase for $${book.price.toFixed(2)}`}
                </Button>
              )}
            </Show>

            <Show when="signed-out">
              <div className="space-y-3">
                <Link href="/sign-in">
                  <Button size="lg" className="w-full">
                    Sign in to Purchase
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/sign-up" className="text-primary hover:underline">Create one free</Link>
                </p>
              </div>
            </Show>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
