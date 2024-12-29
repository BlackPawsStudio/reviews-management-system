"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "react-query";
import { z } from "zod";
import { type Review } from "~/app/page";
import { type BodyData } from "~/app/api/reviews/route";
import { useEffect, useState } from "react";
import { useToast } from "~/hooks/use-toast";

export const schema = z.object({
  title: z.string().nonempty("Title is required"),
  content: z.string().nonempty("Content is required"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  author: z.string().nonempty("Author is required"),
});

interface ReviewFormProps {
  id?: number;
}

export const ReviewForm = ({ id }: ReviewFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [defaultValues, setDefaultValues] = useState<BodyData | null>(null);

  const form = useForm({
    validators: {
      onChange: schema,
    },
    ...(defaultValues ? { defaultValues } : {}),
    onSubmit: async (data) => {
      mutate(data.value);
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    if (id !== undefined) {
      const getSavedReview = async () => {
        await fetch(`/api/reviews/${id}`)
          .then(async (res) => {
            try {
              if (res.status !== 200) {
                throw new Error(res.status + ": " + (await res.text()));
              }

              return (await res.json()) as { data: BodyData };
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "An error occurred";
              toast({
                title: message,
                variant: "destructive",
              });
              return undefined;
            }
          })
          .then(async (data) => {
            if (data) {
              setDefaultValues(data.data);
            }
          });
      };
      void getSavedReview();
    }
  }, [form, id, toast]);

  const { mutate, isLoading } = useMutation({
    mutationFn: async (review: BodyData): Promise<Review | undefined> => {
      try {
        const res = await fetch(`/api/reviews/${id ?? ""}`, {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(review),
        });

        if (res.status !== 200) {
          throw new Error(res.status + ": " + (await res.text()));
        }

        return (await res.json()) as Review;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        toast({
          title: message,
          variant: "destructive",
        });
      }
    },
    onSuccess: async (newReview) => {
      await queryClient.cancelQueries("reviews");
      const previousReviews = queryClient.getQueryData("reviews");
      if (newReview) {
        queryClient.setQueryData("reviews", (old: Review[] = []) => {
          return [...old, newReview];
        });
      }
      await queryClient.invalidateQueries("reviews");
      router.push("/");
      return { previousReviews };
    },
  });

  const handleCancel = () => router.push("/");

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold">
        {id === undefined ? "Create Review" : "Edit review"}
      </h1>
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
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-muted"
                  }
                  disabled={isLoading}
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
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-muted"
                  }
                  disabled={isLoading}
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
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-muted"
                  }
                  disabled={isLoading}
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
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(+e.target.value)}
                  className={
                    field.state.meta.errors.length
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-muted"
                  }
                  disabled={isLoading}
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
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            asChild
          >
            <div className="cursor-pointer">Cancel</div>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
