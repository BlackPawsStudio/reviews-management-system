import { cn } from "~/lib/utils";

function Skeleton({
  className,
  count = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-md bg-muted", className)}
          {...props}
        />
      ))}
    </>
  );
}

export { Skeleton };
