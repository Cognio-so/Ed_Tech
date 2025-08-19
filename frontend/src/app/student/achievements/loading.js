import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AchievementsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Header with Skeleton */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <Skeleton className="h-14 w-72 md:h-16 md:w-96" />
              <Skeleton className="h-7 w-64 md:h-8 md:w-80" />
            </div>
            
            <div className="flex gap-3">
              <Skeleton className="hidden sm:block h-11 w-40 rounded-2xl" />
              <Skeleton className="h-11 w-44 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="border-0 rounded-2xl shadow-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
              <CardContent className="p-4 text-center">
                <Skeleton className="h-12 w-12 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter Skeleton */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton key={item} className="h-11 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Trophy Case Skeleton */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 px-6 py-4">
            <Skeleton className="h-9 w-64 bg-white/30" />
            <Skeleton className="h-6 w-80 mt-1 bg-white/20" />
          </div>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-xl">
                  <Skeleton className="h-5 w-16 rounded-md absolute top-3 right-3" />
                  
                  <div className="text-center space-y-4">
                    <Skeleton className="mx-auto w-20 h-20 rounded-full" />
                    
                    <div>
                      <Skeleton className="h-7 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-40 mx-auto mb-3" />
                      <Skeleton className="h-5 w-24 rounded-full mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Section Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <Card className="border-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 px-6 py-4">
              <Skeleton className="h-7 w-48 bg-white/30" />
              <Skeleton className="h-5 w-56 mt-1 bg-white/20" />
            </div>
            <CardContent className="p-6 space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl xl:col-span-2 rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 px-6 py-4">
              <Skeleton className="h-7 w-40 bg-white/30" />
              <Skeleton className="h-5 w-56 mt-1 bg-white/20" />
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="rounded-2xl p-6 text-center bg-gray-100 dark:bg-gray-700">
                    <Skeleton className="h-10 w-10 mx-auto mb-3 rounded-full" />
                    <Skeleton className="h-4 w-12 mx-auto mb-1" />
                    <Skeleton className="h-6 w-32 mx-auto mb-3" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    
                    <Skeleton className="h-6 w-24 mx-auto mt-3 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
