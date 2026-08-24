import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonCards } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-4 h-9 w-48" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="mt-10 h-10 w-full max-w-sm" />
      <div className="mt-8">
        <SkeletonCards />
      </div>
    </Container>
  );
}
