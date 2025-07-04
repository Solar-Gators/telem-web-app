import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import { getCellStatus } from "@/lib/telemetry-utils";
import ClientOnly from "@/components/ClientOnly";

interface CellMonitoringProps {
  lowCellV: number;
  highCellV: number;
  highCellT: number;
  cellIdxLowV: number;
  cellIdxHighT: number;
}

export default function CellMonitoring({
  lowCellV,
  highCellV,
  highCellT,
  cellIdxLowV,
  cellIdxHighT,
}: CellMonitoringProps) {
  const status = getCellStatus(lowCellV);

  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ClientOnly
            fallback={
              <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
            }
          >
            <Thermometer className="h-4 w-4" suppressHydrationWarning />
          </ClientOnly>
          Cell Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div>Low Cell</div>
            <div className={`font-bold ${getStatusColor()}`}>
              {lowCellV.toFixed(2)}
              <span className="ml-1 text-muted-foreground text-xs">V</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Cell #{cellIdxLowV}
            </div>
          </div>
          <div>
            <div>High Cell</div>
            <div className={`font-bold ${getStatusColor()}`}>
              {highCellV.toFixed(2)}
              <span className="ml-1 text-muted-foreground text-xs">V</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Cell #{cellIdxHighT}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-muted-foreground">Highest Cell Temp</div>
            <div
              className={`font-bold ${
                highCellT > 45
                  ? "text-red-600"
                  : highCellT > 35
                    ? "text-yellow-600"
                    : "text-green-600"
              }`}
            >
              {highCellT.toFixed(1)}°C
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
