"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/components/ui/button";
import { Calendar } from "@/modules/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/components/ui/popover";

type CommonProps = {
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type DatePickerProps = CommonProps &
  (
    | { mode?: "single"; value?: Date; onChange: (date: Date | undefined) => void }
    | { mode: "range"; value?: DateRange; onChange: (range: DateRange | undefined) => void }
  );

export function DatePicker(props: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const isRange = props.mode === "range";
  const selected = isRange ? props.value?.from : props.value;
  const label = isRange
    ? props.value?.from
      ? props.value.to
        ? props.value.from.getFullYear() === props.value.to.getFullYear()
          ? `${format(props.value.from, "MMM d")} – ${format(props.value.to, "MMM d, yyyy")}`
          : `${format(props.value.from, "MMM d, yyyy")} – ${format(props.value.to, "MMM d, yyyy")}`
        : `${format(props.value.from, "MMM d, yyyy")} – Select end date`
      : (props.placeholder ?? "Select date range")
    : props.value
      ? format(props.value, "MMM d, yyyy")
      : (props.placeholder ?? "Select date");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={props.id}
          type="button"
          variant="outline"
          disabled={props.disabled}
          aria-label={props["aria-label"]}
          aria-describedby={props["aria-describedby"]}
          aria-invalid={props["aria-invalid"]}
          className={cn(
            "h-10 w-full min-w-0 justify-start gap-2 px-3 text-left font-normal",
            !selected && "text-muted-foreground",
            props.className,
          )}
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0">
        {props.mode === "range" ? (
          <Calendar
            mode="range"
            selected={props.value}
            onSelect={(range) => {
              props.onChange(range);
              if (range?.from && range.to) setOpen(false);
            }}
            captionLayout="dropdown"
          />
        ) : (
          <Calendar
            mode="single"
            selected={props.value}
            onSelect={(date) => {
              props.onChange(date);
              setOpen(false);
            }}
            captionLayout="dropdown"
          />
        )}
        {selected && (
          <div className="flex justify-end border-t border-border p-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                props.onChange(undefined);
                setOpen(false);
              }}
            >
              Clear date{isRange ? "s" : ""}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
