import { TelemetryData } from "@/lib/types";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

interface StatsGraphTabProps {
  telemetryData: TelemetryData;
}

const chartData = [
  { placeholder: "1", placeholder2: "2", xaxis: "1" },
  { placeholder: "2", placeholder2: "1", xaxis: "2" },
  { placeholder: "1", placeholder2: "2", xaxis: "3" },
  { placeholder: "2", placeholder2: "1", xaxis: "4" },
  { placeholder: "1", placeholder2: "2", xaxis: "5" },
  { placeholder: "2", placeholder2: "1", xaxis: "6" },
  { placeholder: "1", placeholder2: "2", xaxis: "7" },
];

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
  const selectGroups = generateSelectGroups();

  const handleValueChange = (value: string) => {
    // Handle selection change - this could update chart data
    console.log('Selected:', value);
  };

  const getFieldValue = (dataPath: string, value: string): number | undefined => {
    // Handle custom calculations
    if (dataPath.startsWith('custom.')) {
      return getCustomValue(telemetryData, dataPath);
    }
    
    // Use the enhanced getValueFromPath that handles special cases
    return getValueFromPath(telemetryData, dataPath, value);
  };

  return (
    <div>
      <div className="grid place-items-center">
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
      </div>

      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="xaxis"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey="placeholder"
            type="monotone"
            stroke="var(--color-placeholder)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="placeholder2"
            type="monotone"
            stroke="var(--color-placeholder2)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
