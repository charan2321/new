import { Link } from "wouter";
import { useGetFeaturedBooks, getGetFeaturedBooksQueryKey, useGetCategories, getGetCategoriesQueryKey, useGetBestsellers, getGetBestsellersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, BookOpen, Star, TrendingUp, Globe2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredBooks, isLoading: isLoadingFeatured } = useGetFeaturedBooks({ query: { queryKey: getGetFeaturedBooksQueryKey() }});
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories({ query: { queryKey: getGetCategoriesQueryKey() }});
  const { data: bestsellers, isLoading: isLoadingBestsellers } = useGetBestsellers({ query: { queryKey: getGetBestsellersQueryKey() }});

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <Star className="mr-2 h-4 w-4" />
                Premium Language Learning
              </div>
              <h1 className="font-serif text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                Master languages through <span className="text-primary italic">beautiful</span> reading.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Expertly crafted digital textbooks for ambitious learners. Immerse yourself in structured journeys that feel less like studying, and more like discovery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/store">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Browse Library <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    Create Account
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2.5rem] transform rotate-3 scale-105 blur-xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {isLoadingFeatured ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className={`rounded-xl aspect-[3/4] ${i % 2 === 1 ? 'mt-8' : ''}`} />
                  ))
                ) : (
                  featuredBooks?.slice(0, 4).map((book, i) => (
                    <Link key={book.id} href={`/books/${book.id}`}>
                      <div className={`relative rounded-xl overflow-hidden aspect-[3/4] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${i % 2 === 1 ? 'mt-8' : ''}`}>
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center p-6 text-center">
                            <span className="font-serif font-bold text-white text-lg">{book.title}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="pointer-events-none">View Details</Button>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">Curated Selections</h2>
              <p className="text-muted-foreground">Hand-picked textbooks to start your journey.</p>
            </div>
            <Link href="/store?featured=true">
              <Button variant="ghost" className="hidden sm:flex group">
                View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingFeatured ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : (
              featuredBooks?.slice(0, 4).map((book, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={book.id}
                  className="group cursor-pointer"
                >
                  <Link href={`/books/${book.id}`}>
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 border border-border/50 shadow-sm transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-md">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center p-6 text-center">
                          <span className="font-serif font-bold text-white text-lg">{book.title}</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-background/90 backdrop-blur text-foreground text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {book.language}
                        </span>
                        <span className="bg-primary/90 backdrop-blur text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                          {book.level}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                    <p className="font-medium">${book.price.toFixed(2)}</p>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Languages/Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Globe2 className="mx-auto h-8 w-8 text-primary mb-4" />
            <h2 className="font-serif text-3xl font-bold mb-4">Choose Your Language</h2>
            <p className="text-muted-foreground">Comprehensive materials available for beginners to advanced learners across multiple languages.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
            ) : (
              categories?.map((cat, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  key={cat.name}
                >
                  <Link href={`/store?language=${encodeURIComponent(cat.name)}`}>
                    <div className="bg-muted/40 hover:bg-muted/80 border border-border/50 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-2xl shadow-sm">
                        {cat.icon || "📚"}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.count} books</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center rounded-full bg-secondary-foreground/10 px-3 py-1 text-sm font-medium mb-4">
                <TrendingUp className="mr-2 h-4 w-4" /> Bestsellers
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The Most Popular Paths to Fluency</h2>
              <p className="text-secondary-foreground/70">Join thousands of successful learners who have mastered a new language using these proven textbooks.</p>
            </div>
            <Link href="/store?bestseller=true">
              <Button variant="outline" className="bg-transparent border-secondary-foreground/20 hover:bg-secondary-foreground/10 text-secondary-foreground">
                Browse Bestsellers
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingBestsellers ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-secondary-foreground/10" />)
            ) : (
              bestsellers?.slice(0, 3).map((book, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={book.id}
                >
                  <Link href={`/books/${book.id}`}>
                    <div className="flex gap-6 items-center bg-secondary-foreground/5 rounded-xl p-4 hover:bg-secondary-foreground/10 transition-colors border border-secondary-foreground/10">
                      <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-background flex items-center justify-center p-2 text-center">
                            <span className="font-serif font-bold text-foreground text-xs">{book.title}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg mb-1 leading-tight">{book.title}</h3>
                        <p className="text-sm text-secondary-foreground/70 mb-3">{book.author}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-yellow-400">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="ml-1 text-sm font-medium text-secondary-foreground">{book.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm font-medium">${book.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
