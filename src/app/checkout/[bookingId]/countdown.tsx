import { cn } from "@/lib/utils";

// 754_000 ms -> "12:34"
function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Pure display: the parent owns the ticking clock, so "time's up" and the countdown can never disagree.
// role="timer" tells screen readers this changes every second (and not to announce every tick).
export function Countdown({ remainingMs }: { remainingMs: number }) {
  const urgent = remainingMs <= 60_000;
  return (
    <div
      role="timer"
      aria-label={`Time left to pay: ${formatRemaining(remainingMs)}`}
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-3",
        urgent ? "border-destructive/40 bg-destructive/10 text-destructive" : "bg-muted/50",
      )}
    >
      <span className="text-sm">Seats held for you</span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{formatRemaining(remainingMs)}</span>
    </div>
  );
}