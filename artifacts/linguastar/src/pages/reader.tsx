import { useEffect, useCallback, useState } from "react";
import { useLocation, Link } from "wouter";
import { Show } from "@clerk/react";
import {
  useGetBookContent, getGetBookContentQueryKey,
  useGetReadingProgress, getGetReadingProgressQueryKey,
  useUpdateReadingProgress, getListReadingProgressQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ReaderProps {
  id: number;
}

function ProtectedContent({ id }: ReaderProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const { data: content, isLoading, error } = useGetBookContent(id, {
    query: { enabled: !!id, queryKey: getGetBookContentQueryKey(id) },
  });

  const { data: progress } = useGetReadingProgress(id, {
    query: {
      enabled: !!id,
      queryKey: getGetReadingProgressQueryKey(id),
    },
  });

  const updateProgress = useUpdateReadingProgress();

  // Restore saved page
  useEffect(() => {
    if (progress?.currentPage) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress]);

  // Redirect on 403 (not purchased)
  useEffect(() => {
    if (error && (error as any)?.status === 403) {
      setLocation(`/books/${id}`);
    }
  }, [error, id, setLocation]);

  // Disable right-click, keyboard shortcuts, text selection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["s", "u", "a", "p", "c", "x"].includes(e.key.toLowerCase())) ||
        (e.metaKey && ["s", "u", "a", "p", "c", "x"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const saveProgress = useCallback(
    async (page: number) => {
      if (!content || isSaving) return;
      setIsSaving(true);
      try {
        await updateProgress.mutateAsync(
          { bookId: id, data: { currentPage: page, totalPages: content.totalPages } },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetReadingProgressQueryKey(id) });
              queryClient.invalidateQueries({ queryKey: getListReadingProgressQueryKey() });
            },
          }
        );
      } finally {
        setIsSaving(false);
      }
    },
    [content, id, isSaving, updateProgress, queryClient]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (!content) return;
      const clamped = Math.max(1, Math.min(content.totalPages, page));
      setCurrentPage(clamped);
      saveProgress(clamped);
    },
    [content, saveProgress]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col">
        <div className="h-14 border-b border-white/10 flex items-center px-4 gap-4">
          <Skeleton className="h-8 w-24 bg-white/10" />
          <Skeleton className="h-4 w-48 bg-white/10" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full max-w-2xl h-96 bg-white/5 rounded-xl mx-4" />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center text-white/60">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Content unavailable</p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10">
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const percent = Math.round((currentPage / content.totalPages) * 100);
  const lines = content.content.split("\n");
  const linesPerPage = 30;
  const startLine = (currentPage - 1) * linesPerPage;
  const pageLines = lines.slice(startLine, startLine + linesPerPage);

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 h-14 border-b border-white/10 bg-stone-950/95 backdrop-blur flex items-center px-4 gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-100 hover:bg-white/10 gap-1">
            <ArrowLeft className="h-4 w-4" /> Library
          </Button>
        </Link>
        <div className="flex-1 hidden sm:block">
          <p className="font-serif text-sm font-medium truncate">{content.title}</p>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Lock className="h-3 w-3 text-stone-500" />
          <span className="text-xs text-stone-500">Protected</span>
          <span className="text-xs text-stone-400">
            Page {currentPage} / {content.totalPages}
          </span>
          {isSaving && <span className="text-xs text-stone-500">Saving...</span>}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={percent} className="h-0.5 rounded-none bg-stone-800 [&>div]:bg-amber-500" />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Watermark */}
          <div
            className="absolute pointer-events-none select-none opacity-[0.03] text-white text-6xl font-bold rotate-[-35deg] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
            aria-hidden
          >
            LINGUASTAR PROTECTED
          </div>

          <div
            className="prose prose-invert prose-stone max-w-none leading-relaxed"
            onDragStart={(e) => e.preventDefault()}
          >
            {pageLines.map((line, i) => {
              if (line.startsWith("# ")) return <h1 key={i} className="font-serif text-2xl font-bold mb-6 text-stone-100">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="font-serif text-xl font-bold mb-4 mt-8 text-stone-200">{line.slice(3)}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="font-serif text-lg font-semibold mb-3 mt-6 text-stone-300">{line.slice(4)}</h3>;
              if (line.trim() === "") return <div key={i} className="h-4" />;
              return <p key={i} className="mb-3 text-stone-300 leading-7">{line}</p>;
            })}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 border-t border-white/10 bg-stone-950/95 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-400 hover:text-stone-100 hover:bg-white/10"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-stone-500 w-6 text-right">{currentPage}</span>
            <Slider
              value={[currentPage]}
              min={1}
              max={content.totalPages}
              step={1}
              onValueChange={([val]) => goToPage(val)}
              className="flex-1 [&_[role=slider]]:bg-amber-500 [&_[data-orientation=horizontal]]:bg-stone-700"
            />
            <span className="text-xs text-stone-500 w-6">{content.totalPages}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-stone-400 hover:text-stone-100 hover:bg-white/10"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= content.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-w-2xl mx-auto mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">{percent}% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reader({ id }: ReaderProps) {
  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-in">
        <ProtectedContent id={id} />
      </Show>
      <Show when="signed-out">
        {(() => { setLocation("/sign-in"); return null; })()}
      </Show>
    </>
  );
}
