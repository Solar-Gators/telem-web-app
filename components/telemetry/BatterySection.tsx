import { Battery } from "lucide-react";
import { TelemetryData } from "@/lib/types";
import { getBatteryStatus } from "@/lib/telemetry-utils";
import SimpleCard from "./SimpleCard";
import CellMonitoring from "./CellMonitoring";
import ClientOnly from "@/components/ClientOnly";

interface BatterySectionProps {
  batteryData: TelemetryData<number>["battery"];
  lastUpdated?: Date;
}

export default function BatterySection({
  batteryData,
  lastUpdated,
}: BatterySectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ClientOnly
          fallback={<div className="w-5 h-5 bg-muted-foreground/20 rounded" />}
        >
          <Battery className="h-5 w-5" suppressHydrationWarning />
        </ClientOnly>
        Battery Systems
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <SimpleCard
            title="Main Battery"
            value={batteryData.main_bat_v}
            unit="V"
            icon={Battery}
            status={getBatteryStatus(batteryData.main_bat_v, "main")}
            subtitle={batteryData.main_bat_c.toFixed(1)}
            subtitleUnit="A"
            subtitleFullSize={true}
            lastUpdated={lastUpdated}
          />
          <SimpleCard
            title="Supplemental Battery"
            value={batteryData.sup_bat_v}
            unit="V"
            icon={Battery}
            subtitleFullSize={true}
            status={getBatteryStatus(batteryData.sup_bat_v, "supplemental")}
            lastUpdated={lastUpdated}
          />
        </div>

        <CellMonitoring
          lowCellV={batteryData.low_cell_v}
          highCellV={batteryData.high_cell_v}
          highCellT={batteryData.high_cell_t}
          cellIdxLowV={batteryData.cell_idx_low_v}
          cellIdxHighT={batteryData.cell_idx_high_t}
        />
      </div>
    </div>
  );
}
