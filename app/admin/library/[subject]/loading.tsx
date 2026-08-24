import { Container } from "@/components/ui/container";
import { Skeleton, SkeletonPanels } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-20">
      <Skeleton className="h-3 w-32" />
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="min-w-0 lg:order-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 aspect-[12/6] w-full rounded-xl" />
          <Skeleton className="mt-6 h-3 w-full" />
        </div>
        <div className="min-w-0 lg:order-1">
          <SkeletonPanels />
        </div>
      </div>
    </Container>
  );
}
