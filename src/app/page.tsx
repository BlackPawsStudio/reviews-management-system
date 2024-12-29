"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQuery } from "react-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";

export interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  author: string;
  createdAt: string;
}

export const DashboardPage = ({
  params,
}: {
  params: Promise<{ page: string }>;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const [authorFilter, setAuthorFilter] = useState<string[]>([]);

  const [filters, setFilters] = useState<{
    search: string;
    author?: string;
    rating?: string;
  }>({
    search: "",
  });

  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);

  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery(
    ["reviews", page, filters],
    async (): Promise<Review[]> => {
      try {
        const res = await fetch(
          "/api/reviews?" +
            new URLSearchParams({
              page: String(page ?? 1),
              search: filters.search,
              ...(filters.author ? { author: filters.author } : {}),
              ...(filters.rating ? { rating: filters.rating } : {}),
            }).toString(),
        );

        if (res.status !== 200) {
          throw new Error(res.status + ": " + (await res.text()));
        }

        const { data, pages, uniqueAuthors } = (await res.json()) as {
          data: Review[];
          pages: number;
          uniqueAuthors: string[];
        };

        setPagesCount(pages);
        setAuthorFilter(uniqueAuthors);

        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        toast({
          title: message,
          variant: "destructive",
        });
        return [];
      }
    },
  );

  useEffect(() => {
    void (async () => {
      setPage(Number((await params).page ?? 1));
    })();
  }, [params]);

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-xl font-bold">Reviews Dashboard</h1>
      <div className="flex gap-x-4">
        <Input
          placeholder="Search by title"
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
        />
        <div className="relative w-full">
          <Select
            key={filters.author}
            value={filters.author}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, author: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by author" />
            </SelectTrigger>
            <SelectContent>
              {authorFilter.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.author && (
            <Button
              variant="outline"
              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full p-0"
              onClick={() =>
                setFilters((prev) => ({ ...prev, author: undefined }))
              }
            >
              X
            </Button>
          )}
        </div>
        <div className="relative w-full">
          <Select
            key={filters.rating}
            value={filters.rating}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, rating: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => i + 1).map((idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {idx}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.rating && (
            <Button
              variant="outline"
              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full p-0"
              onClick={() =>
                setFilters((prev) => ({ ...prev, rating: undefined }))
              }
            >
              X
            </Button>
          )}
        </div>
        <Button onClick={() => router.push("/review/new")}>Add Review</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[73px]" count={5} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="w-0">Created At</TableHead>
              <TableHead className="w-0">Rating</TableHead>
              <TableHead className="w-0">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((review) => (
              <TableRow key={review.id + review.title}>
                <TableCell>{review.title}</TableCell>
                <TableCell>{review.content}</TableCell>
                <TableCell>{review.author}</TableCell>
                <TableCell>{review.createdAt}</TableCell>
                <TableCell className="text-center">{review.rating}</TableCell>
                <TableCell className="flex gap-x-4">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/review/${review.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(review.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {pagesCount > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  setPage((prev) => Math.max(prev - 1, 1));
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
                {1}
              </PaginationLink>
            </PaginationItem>
            {page - 1 > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {Array.from({ length: pagesCount - 1 }, (_, i) => i + 1).map((i) =>
              Math.abs(page - i) < 2 && i !== 1 ? (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i}
                    onClick={() => setPage(i)}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              ) : null,
            )}
            {pagesCount - page > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                isActive={page === pagesCount}
                onClick={() => setPage(pagesCount)}
              >
                {pagesCount}
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagesCount))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={showDeleteModal}
        onOpenChange={(e) => {
          if (!e) setShowDeleteModal(false);
        }}
      >
        <DialogContent>
          <DialogHeader>Confirm Delete</DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this review?
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={async () => {
                await fetch(`/api/reviews/${deleteId}`, { method: "DELETE" });
                setShowDeleteModal(false);
                await refetch();
              }}
            >
              Delete
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
