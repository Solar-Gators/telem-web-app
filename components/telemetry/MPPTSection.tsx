import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";
import { MPPTData, TelemetryData } from "@/lib/types";
import { calculateMPPTPower } from "@/lib/telemetry-utils";
import ClientOnly from "@/components/ClientOnly";

interface MPPTSectionProps {
  mppt1?: TelemetryData<number>["mppt1"];
  mppt2?: TelemetryData<number>["mppt2"];
  mppt3?: TelemetryData<number>["mppt3"];
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
            {outputPower.toFixed(0)}
            <span className="text-muted-foreground text-sm"> W</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {data.output_v.toFixed(1)} V × {data.output_c.toFixed(1)} A
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Input</div>
          <div className="text-md text-base font-bold">
            {inputPower.toFixed(0)}
            <span className="text-muted-foreground text-xs"> W</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {data.input_v.toFixed(1)} V × {data.input_c.toFixed(1)} A
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
  const getLastUpdated = (mppt: TelemetryData<Date>["mppt1"]) => {
    if (
      !mppt?.input_v ||
      !mppt?.input_c ||
      !mppt?.output_v ||
      !mppt?.output_c
    ) {
      return undefined;
    }
    return new Date(
      Math.max(
        mppt.input_v.getTime(),
        mppt.input_c.getTime(),
        mppt.output_v.getTime(),
        mppt.output_c.getTime(),
      ),
    );
  };

  const mppt1LastUpdated = getLastUpdated(dateData.mppt1);
  const mppt2LastUpdated = getLastUpdated(dateData.mppt2);
  const mppt3LastUpdated = getLastUpdated(dateData.mppt3);

  // Create default MPPT data for missing values
  const defaultMPPTData: MPPTData = {
    input_v: 0,
    input_c: 0,
    output_v: 0,
    output_c: 0,
  };

  const mppt1Data: MPPTData =
    mppt1 &&
    mppt1.input_v !== undefined &&
    mppt1.input_c !== undefined &&
    mppt1.output_v !== undefined &&
    mppt1.output_c !== undefined
      ? {
          input_v: mppt1.input_v,
          input_c: mppt1.input_c,
          output_v: mppt1.output_v,
          output_c: mppt1.output_c,
        }
      : defaultMPPTData;

  const mppt2Data: MPPTData =
    mppt2 &&
    mppt2.input_v !== undefined &&
    mppt2.input_c !== undefined &&
    mppt2.output_v !== undefined &&
    mppt2.output_c !== undefined
      ? {
          input_v: mppt2.input_v,
          input_c: mppt2.input_c,
          output_v: mppt2.output_v,
          output_c: mppt2.output_c,
        }
      : defaultMPPTData;

  const mppt3Data: MPPTData =
    mppt3 &&
    mppt3.input_v !== undefined &&
    mppt3.input_c !== undefined &&
    mppt3.output_v !== undefined &&
    mppt3.output_c !== undefined
      ? {
          input_v: mppt3.input_v,
          input_c: mppt3.input_c,
          output_v: mppt3.output_v,
          output_c: mppt3.output_c,
        }
      : defaultMPPTData;

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
        <MPPTCard
          title="MPPT 1"
          data={mppt1Data}
          lastUpdated={mppt1LastUpdated}
        />
        <MPPTCard
          title="MPPT 2"
          data={mppt2Data}
          lastUpdated={mppt2LastUpdated}
        />
        <MPPTCard
          title="MPPT 3"
          data={mppt3Data}
          lastUpdated={mppt3LastUpdated}
        />
      </div>
    </div>
  );
}
