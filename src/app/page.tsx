"use client";
import { useState } from "react";
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

export interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  author: string;
  createdAt: string;
}

const DashboardPage = () => {
  const [filters, setFilters] = useState({ author: "", rating: "", title: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery(
    ["reviews"],
    async (): Promise<Review[]> => {
      const res = await fetch("/api/reviews");

      const { data } = (await res.json()) as { data: Review[] };

      return data;
    },
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <h1 className="text-xl font-bold">Reviews Dashboard</h1>
      <div className="flex gap-x-4">
        <Input
          placeholder="Search by title"
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <Input
          placeholder="Filter by author"
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
        />
        <Input
          placeholder="Filter by rating"
          type="number"
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        />
        <Button onClick={() => router.push("/details")}>Add Review</Button>
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
                    onClick={() => router.push(`/details/${review.id}`)}
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
