"use client";

import { useEffect, useRef } from "react";

import type { SeatCategory } from "@/lib/events";
import { formatCategory, formatPrice } from "@/lib/format";
import type { SeatRow } from "@/lib/seats";
import { cn } from "@/lib/utils";

// Each category has its own colour, so prices are easy to spot on the map
export const CATEGORY_STYLES: Record<SeatCategory, string> = {
  SILVER: "border-slate-400 bg-slate-50 hover:bg-slate-200",
  GOLD: "border-amber-500 bg-amber-50 hover:bg-amber-200",
  PLATINUM: "border-violet-500 bg-violet-50 hover:bg-violet-200",
};
export const SELECTED_STYLE = "border-primary bg-primary text-primary-foreground";
export const TAKEN_STYLE = "cursor-not-allowed border-transparent bg-muted text-muted-foreground/40";

type Props = {
  rows: SeatRow[];
  selectedIds: Set<number>;
  priceOf: (category: SeatCategory) => number | undefined;
  onToggle: (seatId: number) => void;
};

// Pure display: the picker owns the state. Wide venues scroll sideways instead of squashing seats.
export function SeatGrid({ rows, selectedIds, priceOf, onToggle }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // On a phone the map is wider than the screen: start scrolled to the middle (the stage), not the left edge
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
    }
  }, []);

  return (
    <div ref={scrollerRef} className="overflow-x-auto rounded-xl border p-4">
      <div className="mx-auto grid w-max gap-1.5">
        <div className="mb-4 rounded-md bg-muted py-1 text-center text-xs tracking-widest text-muted-foreground uppercase">
          Stage
        </div>
        {rows.map((row) => (
          // Row label | seats (centred, so shorter rows line up under the stage) | row label
          <div key={row.label} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-1">
            <span className="text-center text-xs font-medium text-muted-foreground">{row.label}</span>
            <div className="flex justify-center gap-1">
              {row.seats.map((seat) => {
                const selected = selectedIds.has(seat.id);
                const available = seat.status === "AVAILABLE";
                const price = priceOf(seat.category);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    aria-label={`Row ${row.label} seat ${seat.number}, ${formatCategory(seat.category)}${
                      price !== undefined ? `, ${formatPrice(price)}` : ""
                    }, ${available ? "available" : "taken"}`}
                    onClick={() => onToggle(seat.id)}
                    className={cn(
                      "size-7 shrink-0 rounded-t-md rounded-b-sm border text-[10px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      !available ? TAKEN_STYLE : selected ? SELECTED_STYLE : CATEGORY_STYLES[seat.category],
                    )}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="text-center text-xs font-medium text-muted-foreground">{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}