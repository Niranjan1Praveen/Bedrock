import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-10 sm:py-14">
      <Skeleton className="h-3 w-48" />
      <div className="mt-5 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-3 h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-11 w-full rounded-t-xl" />
      <Skeleton className="mt-px h-[70vh] w-full rounded-b-xl" />
    </Container>
  );
}
