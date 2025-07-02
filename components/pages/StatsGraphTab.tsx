import { TelemetryData } from "@/lib/types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSelectGroups, getValueFromPath } from "@/lib/chart-config";
import { getCustomValue } from "@/lib/telemetry-utils";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchTelemetryDataInRange } from "@/lib/db-utils";

interface StatsGraphTabProps {
  telemetryData: TelemetryData;
}

const chartConfig = {
  placeholder: {
    label: "Fake Data",
    color: "var(--chart-1)",
  },
  placeholder2: {
    label: "Fake Data 2",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function StatsGraphTab({ telemetryData }: StatsGraphTabProps) {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [dataKey, setDataKey] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const selectGroups = generateSelectGroups();

  const handleValueChange = (value: string) => {
    // Handle selection change - this could update chart data
    setDataKey(value.replace(".", "_"));
  };

  const getFieldValue = (
    dataPath: string,
    value: string
  ): number | undefined => {
    // Handle custom calculations
    if (dataPath.startsWith("custom.")) {
      return getCustomValue(telemetryData, dataPath);
    }

    // Use the enhanced getValueFromPath that handles special cases
    return getValueFromPath(telemetryData, dataPath, value);
  };

  useEffect(() => {
    if (dataKey && startDate && endDate) {
      fetchTelemetryDataInRange(startDate, endDate, dataKey).then((data) => {
        if (data != null) {
          setChartData(data);
        }
      });
    }
  }, [dataKey, startDate, endDate]);

  return (
    <div>
      <div className="grid place-items-center grid-cols-3 gap-4">
        <Select onValueChange={handleValueChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a Statistic" />
          </SelectTrigger>
          <SelectContent>
            {selectGroups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Popover open={open1} onOpenChange={setOpen1}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-32 justify-between font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Start Date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setStartDate(date);
                    setOpen1(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              type="time"
              id="time-picker"
              step="1"
              defaultValue="12:00:00"
              onChange={(time) => {
                startDate?.setHours(parseInt(time.target.value.split(":")[0]));
                startDate?.setMinutes(
                  parseInt(time.target.value.split(":")[1])
                );
              }}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Popover open={open2} onOpenChange={setOpen2}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-32 justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "End Date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setEndDate(date);
                    setOpen2(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              type="time"
              id="time-picker"
              step="1"
              defaultValue="12:00:00"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </div>

      <br></br>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: Date) => {
              const date = value instanceof Date ? value : new Date(value);
              return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
          />
          <YAxis
            label={{
              value: dataKey,
              angle: -90,
              position: "insideLeft",
            }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickCount={5}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey="value"
            type="monotone"
            stroke="#666"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
