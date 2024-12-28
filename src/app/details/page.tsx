"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "react-query";
import type { Review } from "../page";
import { z } from "zod";

const saveReviewAPI = async (review: Review) => {
  const response = await fetch(`/api/reviews/${review.id || ""}`, {
    method: review.id ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(review),
  });
  if (!response.ok) {
    throw new Error("Failed to save review");
  }
  return (await response.json()) as Review;
};

const schema = z.object({
  title: z.string().nonempty("Title is required"),
  content: z.string().nonempty("Content is required"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  author: z.string().nonempty("Author is required"),
});

const ReviewDetailsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    validators: {
      onChange: schema,
    },
    onSubmit: async (data) => {
      console.log(data);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.value),
      });
    },
  });

  // useEffect(() => {
  //   if (!isNew) {
  //     fetch(`/api/reviews/${id}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         setValue('title', data.title);
  //         setValue('content', data.content);
  //         setValue('author', data.author);
  //         setValue('rating', data.rating);
  //       });
  //   } else {
  //     reset();
  //   }
  // }, [id, isNew, setValue, reset]);

  const { mutate } = useMutation(saveReviewAPI, {
    onMutate: async (newReview) => {
      await queryClient.cancelQueries("reviews");
      const previousReviews = queryClient.getQueryData("reviews");
      queryClient.setQueryData("reviews", (old: Review[] = []) => {
        return [...old, newReview];
      });
      return { previousReviews };
    },
    onError: (err, newReview, context) => {
      queryClient.setQueryData("reviews", context?.previousReviews);
    },
    onSettled: () => {
      // queryClient.invalidateQueries("reviews");
    },
  });

  // const onSubmit = (data: Review) => {
  //   setLoading(true);
  //   mutation.mutate(data, {
  //     onSuccess: () => {
  //       router.push("/dashboard");
  //     },
  //     onSettled: () => setLoading(false),
  //   });
  // };

  const handleCancel = () => router.push("/");

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold">Create Review</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="title">Title</label>
          <form.Field
            name="title"
            children={(field) => (
              <>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length ? "border-destructive" : ""
                  }
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <form.Field
            name="content"
            children={(field) => (
              <>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length ? "border-destructive" : ""
                  }
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <label htmlFor="author">Author</label>
          <form.Field
            name="author"
            children={(field) => (
              <>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length ? "border-destructive" : ""
                  }
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </>
            )}
          />
        </div>
        <div>
          <label htmlFor="rating">Rating</label>
          <form.Field
            name="rating"
            children={(field) => (
              <>
                <Input
                  type="number"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(+e.target.value)}
                  className={
                    field.state.meta.errors.length ? "border-destructive" : ""
                  }
                />
                {field.state.meta.errors ? (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewDetailsPage;
