import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";
import { MPPTData, TelemetryData } from "@/lib/types";
import { calculateMPPTPower } from "@/lib/telemetry-utils";
import ClientOnly from "@/components/ClientOnly";

interface MPPTSectionProps {
  mppt1: MPPTData;
  mppt2: MPPTData;
  mppt3: MPPTData;
  dateData: TelemetryData<Date>;
}

interface MPPTCardProps {
  title: string;
  data: MPPTData;
  lastUpdated?: Date;
}

function MPPTCard({ title, data, lastUpdated }: MPPTCardProps) {
  const inputPower = calculateMPPTPower(data.input_v, data.input_c);
  const outputPower = calculateMPPTPower(data.output_v, data.output_c);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Output</div>
          <div className="text-xl font-bold">
            {inputPower.toFixed(0)}
            <span className="text-muted-foreground"> W</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.input_v.toFixed(1)} V × {data.input_c.toFixed(1)} A
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Input</div>
          <div className="text-xl text-base font-bold">
            {outputPower.toFixed(0)}W
          </div>
          <div className="text-sm text-muted-foreground">
            {data.output_v.toFixed(1)} V × {data.output_c.toFixed(1)} A
          </div>
        </div>
        {lastUpdated && (
          <p className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MPPTSection({
  mppt1,
  mppt2,
  mppt3,
  dateData,
}: MPPTSectionProps) {
  const getLastUpdated = (mppt: TelemetryData<Date>["mppt1"]) =>
    new Date(
      Math.max(
        mppt.input_v.getTime(),
        mppt.input_c.getTime(),
        mppt.output_v.getTime(),
        mppt.output_c.getTime(),
      ),
    );

  const mppt1LastUpdated = getLastUpdated(dateData.mppt1);
  const mppt2LastUpdated = getLastUpdated(dateData.mppt2);
  const mppt3LastUpdated = getLastUpdated(dateData.mppt3);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ClientOnly
          fallback={<div className="w-5 h-5 bg-muted-foreground/20 rounded" />}
        >
          <Sun className="h-5 w-5" suppressHydrationWarning />
        </ClientOnly>
        Solar Panel Controllers (MPPT)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MPPTCard title="MPPT 1" data={mppt1} lastUpdated={mppt1LastUpdated} />
        <MPPTCard title="MPPT 2" data={mppt2} lastUpdated={mppt2LastUpdated} />
        <MPPTCard title="MPPT 3" data={mppt3} lastUpdated={mppt3LastUpdated} />
      </div>
    </div>
  );
}
