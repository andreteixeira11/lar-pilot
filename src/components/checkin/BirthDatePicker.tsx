import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BirthDatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BirthDatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  className,
}: BirthDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const fromYear = 1900;
  const toYear = currentYear;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          captionLayout="dropdown-buttons"
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={date || new Date(2000, 0)}
          disabled={(d) => d > new Date()}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
