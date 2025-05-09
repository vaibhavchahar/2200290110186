
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TimeRangeSelectorProps {
  selectedMinutes: number;
  onSelectMinutes: (minutes: number) => void;
  isLoading: boolean;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedMinutes,
  onSelectMinutes,
  isLoading
}) => {
  const timeRanges = [
    { minutes: 5, label: "5m" },
    { minutes: 15, label: "15m" },
    { minutes: 30, label: "30m" },
    { minutes: 60, label: "1h" }
  ];

  return (
    <div className="my-4">
      <h3 className="mb-2 text-sm font-medium">Time Range</h3>
      <RadioGroup 
        value={selectedMinutes.toString()} 
        onValueChange={(value) => onSelectMinutes(parseInt(value))}
        className="flex flex-wrap gap-4"
        disabled={isLoading}
      >
        {timeRanges.map((range) => (
          <div key={range.minutes} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={range.minutes.toString()} 
              id={`timeRange-${range.minutes}`} 
            />
            <Label htmlFor={`timeRange-${range.minutes}`}>
              Last {range.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default TimeRangeSelector;
