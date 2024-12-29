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

  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);

  const { data, isLoading, refetch } = useQuery(
    ["reviews", page],
    async (): Promise<Review[]> => {
      const res = await fetch(
        "/api/reviews?" +
          new URLSearchParams({
            page: String(page ?? 1),
          }).toString(),
      );

      const { data, pages } = (await res.json()) as {
        data: Review[];
        pages: number;
      };

      setPagesCount(pages);

      return data;
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
        <Input placeholder="Search by title" />
        <Input placeholder="Filter by author" />
        <Input placeholder="Filter by rating" type="number" />
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
