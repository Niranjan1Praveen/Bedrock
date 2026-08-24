import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-16 sm:py-20">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-9 w-56" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="mt-8 h-48 w-full rounded-xl" />
    </Container>
  );
}
