import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-violet-900 dark:to-indigo-900 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Banner Skeleton */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 via-purple-500/80 to-pink-500/80"></div>
          <div className="relative px-4 sm:px-6 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4 w-full lg:w-2/3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full bg-white/30" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-3/4 bg-white/30 mb-2" />
                    <Skeleton className="h-5 w-1/2 bg-white/30" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-24 bg-white/30 rounded-full" />
                  <Skeleton className="h-6 w-32 bg-white/30 rounded-full" />
                  <Skeleton className="h-6 w-28 bg-white/30 rounded-full" />
                </div>
              </div>

              <Card className="w-full lg:w-1/3 border-0 rounded-2xl shadow-lg bg-white/90 dark:bg-gray-800/90">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <div>
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full rounded-xl mb-3" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl mt-4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>

        {/* Quick Actions Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
              <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievements Skeleton */}
        <Card className="border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-4 py-3">
            <Skeleton className="h-8 w-48 bg-white/30" />
          </div>
          <CardContent className="p-4">
            <div className="space-y-4 py-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Skeleton className="h-10 w-40 rounded-xl mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Subject Cards Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
                <div className="h-36 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-6 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="mt-3 h-9 w-full rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
