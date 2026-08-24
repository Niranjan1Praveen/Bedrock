import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonRows } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-24">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-4 h-10 w-full max-w-lg" />
      <div className="mt-10 flex flex-wrap gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-12">
        <SkeletonRows rows={4} />
      </div>
    </Container>
  );
}
