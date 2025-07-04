import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TelemetryData } from "@/lib/types";
import MapComponent from "../telemetry/MapComponent";
import ClientOnly from "../ClientOnly";

interface TrackFlareTabProps {
  telemetryData: TelemetryData<number>;
  dateData: TelemetryData<Date>;
}

export default function TrackFlareTab({ telemetryData }: TrackFlareTabProps) {
  return (
    <Card className="h-[calc(100vh-200px)]">
      <CardContent className="h-full p-0">
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <ClientOnly
              fallback={
                <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              }
            >
              {telemetryData.gps && (
                <MapComponent
                  location={{
                    lat: telemetryData.gps?.latitude,
                    lng: telemetryData.gps?.longitude,
                  }}
                  satelliteCount={telemetryData.gps?.num_sats}
                />
              )}
            </ClientOnly>
          </div>
          <div className="p-4 border-t bg-background">
            <div className="flex items-center justify-end gap-4">
              <Badge variant="outline" className="text-sm">
                Speed: {telemetryData.gps?.speed.toFixed(1)} mph
              </Badge>

              {telemetryData.gps?.num_sats && (
                <Badge
                  variant={
                    telemetryData.gps.num_sats === 0
                      ? "destructive"
                      : telemetryData.gps.num_sats >= 4
                        ? "default"
                        : "secondary"
                  }
                >
                  {telemetryData.gps.num_sats === 0
                    ? "No Connection"
                    : `${telemetryData.gps.num_sats} Satellites`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
