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
  return (
    <div className="grid h-screen place-items-center">
      <Select>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a Statistic" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>GPS</SelectLabel>
            <SelectItem value="rxt">RX Time</SelectItem>
            <SelectItem value="lon">Longitude</SelectItem>
            <SelectItem value="lat">Latitude</SelectItem>
            <SelectItem value="mph">Speed</SelectItem>
            <SelectItem value="ns">Number of Satellites</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Battery</SelectLabel>
            <SelectItem value="sbv">Sup Battery Voltage</SelectItem>
            <SelectItem value="mbv">Main Battery Voltage</SelectItem>
            <SelectItem value="mbc">Main Battery Current</SelectItem>
            <SelectItem value="lcv">Low Cell Voltage</SelectItem>
            <SelectItem value="hcv">High Cell Voltage</SelectItem>
            <SelectItem value="hct">High Cell T</SelectItem>
            <SelectItem value="ilv">IDX Low Voltage</SelectItem>
            <SelectItem value="ilc">IDX High T</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>MPPT 1</SelectLabel>
            <SelectItem value="iv1">Voltage Input (MPPT 1)</SelectItem>
            <SelectItem value="ov1">Voltage Output (MPPT 1)</SelectItem>
            <SelectItem value="ic1">Current Input (MPPT 1)</SelectItem>
            <SelectItem value="oc1">Current Output (MPPT 1)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>MPPT 2</SelectLabel>
            <SelectItem value="iv2">Voltage Input (MPPT 2)</SelectItem>
            <SelectItem value="ov2">Voltage Output (MPPT 2)</SelectItem>
            <SelectItem value="ic2">Current Input (MPPT 2)</SelectItem>
            <SelectItem value="oc2">Current Output (MPPT 2)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>MPPT 3</SelectLabel>
            <SelectItem value="iv3">Voltage Input (MPPT 3)</SelectItem>
            <SelectItem value="ov3">Voltage Output (MPPT 3)</SelectItem>
            <SelectItem value="ic3">Current Input (MPPT 3)</SelectItem>
            <SelectItem value="oc3">Current Output (MPPT 3)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Mitsuba</SelectLabel>
            <SelectItem value="v">Voltage</SelectItem>
            <SelectItem value="c">Current</SelectItem>
            <SelectItem value="err">Error Frame</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Custom</SelectLabel>
            <SelectItem value="mph">Miles per Hour</SelectItem>
            <SelectItem value="kph">Kilometers per Hour</SelectItem>
            <SelectItem value="soc">State of Charge</SelectItem>
            <SelectItem value="mpc">Motor Power Consumption</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

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
