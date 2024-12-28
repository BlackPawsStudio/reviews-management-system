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

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number; // 1 to 5
  author: string;
  createdAt: string; // ISO date
}

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      title: "Great book",
      content: "I really enjoyed this book",
      rating: 5,
      author: "John Doe",
      createdAt: "2021-01-01",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ author: "", rating: "", title: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
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
        <Button onClick={() => router.push("/review/new")}>Add Review</Button>
      </div>

      {loading ? (
        <Skeleton className="h-[73px]" count={5} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.title}</TableCell>
                <TableCell>{review.author}</TableCell>
                <TableCell>{review.rating}</TableCell>
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
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
