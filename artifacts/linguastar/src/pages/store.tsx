import React, { useState } from "react";
import { Link } from "wouter";
import { 
  useListBooks, 
  getListBooksQueryKey, 
  useGetCategories, 
  getGetCategoriesQueryKey 
} from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, BookOpen, Star, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Store() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Simple debounce for search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const queryParams = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedLanguage !== "all" && { language: selectedLanguage }),
    ...(selectedLevel !== "all" && { level: selectedLevel }),
  };

  const { data: books, isLoading } = useListBooks(queryParams, { 
    query: { queryKey: getListBooksQueryKey(queryParams) }
  });
  
  const { data: categories } = useGetCategories({ 
    query: { queryKey: getGetCategoriesQueryKey() }
  });

  const languages = categories?.map(c => c.name) || ["Spanish", "Japanese", "Mandarin", "French", "Arabic", "German"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  // Client-side sort since API might not support all sorts
  const sortedBooks = React.useMemo(() => {
    if (!books) return [];
    let sorted = [...books];
    if (selectedSort === "price-low") sorted.sort((a, b) => a.price - b.price);
    if (selectedSort === "price-high") sorted.sort((a, b) => b.price - a.price);
    if (selectedSort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    // newest is default API order assuming ID descent or createdAt
    return sorted;
  }, [books, selectedSort]);

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedLanguage("all");
    setSelectedLevel("all");
    setSelectedSort("newest");
  };

  const hasActiveFilters = debouncedSearch || selectedLanguage !== "all" || selectedLevel !== "all";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-4 tracking-tight">The Library</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore our meticulously crafted collection of language learning textbooks. 
            Find the perfect companion for your fluency journey.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search titles, authors..." 
                className="pl-9 bg-muted/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Language</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedLanguage("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLanguage === "all" ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
              >
                All Languages
              </button>
              {languages.map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLanguage === lang ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Proficiency Level</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedLevel("all")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLevel === "all" ? "bg-secondary text-secondary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
              >
                All Levels
              </button>
              {levels.map((level) => (
                <button 
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedLevel === level ? "bg-secondary text-secondary-foreground font-medium" : "hover:bg-muted text-foreground"}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full text-muted-foreground hover:text-destructive">
              <FilterX className="mr-2 h-4 w-4" /> Clear all filters
            </Button>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div className="lg:hidden w-full">
               <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                    {hasActiveFilters && <Badge className="ml-2 bg-primary">Active</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your book search.</SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Search</label>
                      <Input 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Language</label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Languages</SelectItem>
                          {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Level</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline-block">Sort by:</span>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border/50">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Additions</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <p>Showing <span className="font-medium text-foreground">{sortedBooks.length}</span> books</p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[3/4] rounded-xl w-full" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))
            ) : sortedBooks.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-2xl border border-border border-dashed">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">No books found</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  We couldn't find any books matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            ) : (
              <AnimatePresence>
                {sortedBooks.map((book, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    key={book.id}
                    className="group flex flex-col h-full"
                  >
                    <Link href={`/books/${book.id}`} className="flex flex-col h-full">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-5 border border-border/60 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center p-6 text-center">
                            <span className="font-serif font-bold text-white text-xl">{book.title}</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                          <div className="flex flex-col gap-1.5">
                            <Badge variant="secondary" className="w-fit bg-background/90 backdrop-blur hover:bg-background/90 text-foreground font-semibold">
                              {book.language}
                            </Badge>
                            {book.isBestseller && (
                              <Badge className="w-fit bg-yellow-500 hover:bg-yellow-600 text-black border-none font-semibold">
                                Bestseller
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {book.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-1">{book.author}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1.5 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm font-medium text-foreground">{book.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground ml-1">({book.reviewCount})</span>
                          </div>
                          <span className="font-semibold text-lg">${book.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
