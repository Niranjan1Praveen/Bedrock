import { Container } from "@/components/ui/container";
import {
  Skeleton,
  SkeletonFigures,
  SkeletonRows,
} from "@/components/ui/skeleton";

/**
 * Shown the instant a navigation to /admin starts.
 *
 * Without this file Next has nothing to render while the server gathers the
 * page's data, so the browser stays on the previous page and the click appears
 * to do nothing. Its presence also lets Next prefetch this shell for a dynamic
 * route, which it otherwise cannot do.
 */
export default function Loading() {
  return (
    <Container className="py-16 sm:py-20">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-80" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />

      <div className="mt-9 flex flex-wrap gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-36" />
        ))}
      </div>

      <div className="border-line mt-14 border-t pt-8">
        <Skeleton className="h-3 w-24" />
        <div className="mt-6">
          <SkeletonFigures />
        </div>
      </div>

      <div className="border-line mt-12 border-t pt-8">
        <Skeleton className="h-3 w-32" />
        <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-3 h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-line mt-12 border-t pt-8">
        <Skeleton className="h-3 w-20" />
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <SkeletonRows rows={4} />
          <SkeletonRows rows={4} />
        </div>
      </div>
    </Container>
  );
}
