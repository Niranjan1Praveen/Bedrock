import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonRows } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-5 h-9 w-40" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="mt-12">
        <SkeletonRows rows={5} />
      </div>
    </Container>
  );
}
