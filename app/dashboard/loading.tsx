export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 space-y-8">
            {/* Header Skeleton */}
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
            </div>

            {/* Chart/Table Skeleton */}
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>
    );
}
