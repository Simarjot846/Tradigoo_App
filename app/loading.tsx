
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-500" />
        </div>
    );
}
