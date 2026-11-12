
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex justify-center py-20 px-4">
            <div className="container mx-auto space-y-8">
                <div className="flex gap-8">
                    <div className="hidden md:block w-64 space-y-8">
                        <Skeleton className="h-8 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-52 w-full rounded-2xl" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
