import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[68px]" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-[260px]" />
        </div>
        <div className="space-y-3 lg:col-span-4">
          <Skeleton className="h-[220px]" />
          <Skeleton className="h-[88px]" />
        </div>
        <div className="lg:col-span-8">
          <Skeleton className="h-[200px]" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[100px]" />
        </div>
      </div>
    </div>
  )
}
