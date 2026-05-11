import { useState } from "react";
import { useLocation } from "wouter";
import { Show } from "@clerk/react";
import {
  useListBooks, getListBooksQueryKey,
  useCreateBook, useUpdateBook, useDeleteBook,
  useGetMyRole, getGetMyRoleQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
import { motion } from "framer-motion";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title required"),
  author: z.string().min(1, "Author required"),
  description: z.string().min(1, "Description required"),
  price: z.coerce.number().min(0),
  category: z.string().min(1, "Category required"),
  language: z.string().min(1, "Language required"),
  level: z.string().min(1, "Level required"),
  totalPages: z.coerce.number().min(1),
  coverUrl: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  content: z.string().min(1, "Content required"),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

const LANGUAGES = ["Spanish", "Japanese", "Mandarin", "French", "Arabic", "German", "Korean", "Portuguese", "Italian", "Russian"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["Spanish", "Japanese", "Mandarin", "French", "Arabic", "German", "Korean", "Portuguese", "Italian", "Russian"];

function BookForm({ defaultValues, onSubmit, isPending }: {
  defaultValues?: Partial<BookFormValues>;
  onSubmit: (data: BookFormValues) => void;
  isPending: boolean;
}) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      isFeatured: false,
      isBestseller: false,
      content: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} placeholder="Book title" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="author" render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl><Input {...field} placeholder="Author name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea {...field} rows={3} placeholder="Book description" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl><Input {...field} type="number" step="0.01" min="0" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="totalPages" render={({ field }) => (
            <FormItem>
              <FormLabel>Pages</FormLabel>
              <FormControl><Input {...field} type="number" min="1" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="coverUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Cover URL</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} placeholder="https://..." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="language" render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="level" render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-6">
          <FormField control={form.control} name="isFeatured" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="!mt-0">Featured</FormLabel>
            </FormItem>
          )} />
          <FormField control={form.control} name="isBestseller" render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="!mt-0">Bestseller</FormLabel>
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Book Content (Markdown)</FormLabel>
            <FormControl><Textarea {...field} rows={6} placeholder="# Chapter 1&#10;Book content goes here..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Book"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function AdminBooksContent() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<any | null>(null);

  const { data: role } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });
  const { data: books, isLoading } = useListBooks(
    search ? { search } : undefined,
    { query: { queryKey: getListBooksQueryKey(search ? { search } : undefined), enabled: role?.isAdmin } }
  );
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  if (!role?.isAdmin) { setLocation("/dashboard"); return null; }

  function handleCreate(data: BookFormValues) {
    createBook.mutate(
      { data: { ...data, coverUrl: data.coverUrl ?? null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setAddOpen(false);
          toast({ title: "Book created successfully" });
        },
        onError: () => toast({ title: "Failed to create book", variant: "destructive" }),
      }
    );
  }

  function handleUpdate(id: number, data: BookFormValues) {
    updateBook.mutate(
      { id, data: { ...data, coverUrl: data.coverUrl ?? null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          setEditBook(null);
          toast({ title: "Book updated successfully" });
        },
        onError: () => toast({ title: "Failed to update book", variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: number) {
    deleteBook.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });
          toast({ title: "Book deleted" });
        },
        onError: () => toast({ title: "Failed to delete book", variant: "destructive" }),
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold">Book Management</h1>
          <p className="text-muted-foreground mt-1">{books?.length ?? 0} books in catalog</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Book</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
            <BookForm onSubmit={handleCreate} isPending={createBook.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {books?.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                <div className="h-12 w-9 rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/20">
                  <BookOpen className="h-4 w-4 text-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{book.title}</span>
                    {book.isFeatured && <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Featured</Badge>}
                    {book.isBestseller && <Badge className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700 border-amber-200">Bestseller</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{book.author}</span>
                    <span>·</span>
                    <span>{book.category}</span>
                    <span>·</span>
                    <span className="capitalize">{book.level}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">${book.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{book.totalPages} pages</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Dialog open={editBook?.id === book.id} onOpenChange={(open) => { if (!open) setEditBook(null); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditBook(book)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
                      {editBook && (
                        <BookForm
                          defaultValues={{ ...editBook, content: editBook.content ?? "" }}
                          onSubmit={(data) => handleUpdate(editBook.id, data)}
                          isPending={updateBook.isPending}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{book.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone. All purchases and progress for this book will also be removed.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(book.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
          {books?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No books found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminBooks() {
  const [, setLocation] = useLocation();
  return (
    <>
      <Show when="signed-in"><AdminBooksContent /></Show>
      <Show when="signed-out">{(() => { setLocation("/"); return null; })()}</Show>
    </>
  );
}
