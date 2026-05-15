import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className={cn("h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600", className)} />
    </div>
  );
}
