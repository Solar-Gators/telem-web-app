import { TelemetryData } from "@/lib/types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function StatsGraphTab() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [selectedDataKeys, setSelectedDataKeys] = useState<string[]>(["battery_main_bat_v"]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {

  const now = new Date();
  now.setHours(1, 0, 0, 0);
  return now;
});
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(1, 0, 0, 0);
  return now;
});

  const [lineColors] = useState([
    "#8884D8",
    "#D88884",
    "#84D888",
    "#884D88",
    "#88884D",
    "#4D8888",
  ]);

  const selectGroups = generateSelectGroups();

  const handleValueChange = (values: string[]) => {
    setSelectedDataKeys(values.map((v) => v.replace(".", "_")));
  };

  console.log(selectedDataKeys);
  console.log(startDate);
  console.log(endDate);

  useEffect(() => {
    if (selectedDataKeys.length > 0 && startDate && endDate) {
      Promise.all(
        selectedDataKeys.map((key) =>
          fetchTelemetryDataInRange(startDate, endDate, key).then((data) => ({
            key,
            data,
          })),
        ),
      ).then((results) => {
        const mergedData: { [timestamp: string]: any } = {};
        results.forEach(({ key, data }) => {
          data?.forEach((point: any) => {
            const ts = point.timestamp;
            if (!mergedData[ts]) mergedData[ts] = { timestamp: ts };
            mergedData[ts][key] = point.value;
          });
        });
        const mergedArray = Object.values(mergedData).sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        setChartData(mergedArray);
      });
    }
  }, [selectedDataKeys, startDate, endDate]);

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    const interval = setInterval(() => {
      if (selectedDataKeys.length > 0 && startDate && endDate) {
        Promise.all(
          selectedDataKeys.map((key) =>
            fetchTelemetryDataInRange(startDate, endDate, key).then((data) => ({
              key,
              data,
            })),
          ),
        ).then((results) => {
          const mergedData: { [timestamp: string]: any } = {};
          results.forEach(({ key, data }) => {
            data?.forEach((point: any) => {
              const ts = point.timestamp;
              if (!mergedData[ts]) mergedData[ts] = { timestamp: ts };
              mergedData[ts][key] = point.value;
            });
          });
          const mergedArray = Object.values(mergedData).sort(
            (a: any, b: any) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
          setChartData(mergedArray);
        });
      }
    }, 2000);
    setRefreshInterval(interval);

    return () => clearInterval(interval);
  }, [selectedDataKeys, startDate, endDate]);
  return (
    <div>
      <div className="grid place-items-center grid-cols-3 gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-between">
              {selectedDataKeys.length > 0
                ? `${selectedDataKeys.length} Selected`
                : "Select Statistics"}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
            {selectGroups.map((group) => (
              <div key={group.label}>
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {group.options.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={selectedDataKeys.includes(
                      option.value.replace(".", "_"),
                    )}
                    onCheckedChange={(checked) => {
                      const value = option.value.replace(".", "_");
                      const updatedKeys = checked
                        ? [...selectedDataKeys, value]
                        : selectedDataKeys.filter((key) => key !== value);
                      handleValueChange(updatedKeys);
                    }}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
              defaultValue="01:00:00"
              onChange={(time) => {
                startDate?.setHours(parseInt(time.target.value.split(":")[0]));
                startDate?.setMinutes(
                  parseInt(time.target.value.split(":")[1]),
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
              defaultValue="01:00:00"
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
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickCount={5}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          {selectedDataKeys.map((key) => {
            return (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={lineColors[selectedDataKeys.indexOf(key) % 6]}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
