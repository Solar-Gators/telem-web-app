import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusType } from "@/lib/types";
import { LucideIcon } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

interface PowerCardProps {
  title: string;
  voltage: number;
  current: number;
  power: number;
  icon: LucideIcon;
  status?: StatusType;
  lastUpdated?: Date;
}

export default function PowerCard({
  title,
  voltage,
  current,
  power,
  icon: Icon,
  status,
  lastUpdated,
}: PowerCardProps) {
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <ClientOnly
          fallback={<div className="w-4 h-4 bg-muted-foreground/20 rounded" />}
        >
          <Icon
            className="h-4 w-4 text-muted-foreground"
            suppressHydrationWarning
          />
        </ClientOnly>
      </CardHeader>
      <CardContent className="space-y-2 relative">
        <div className={`text-xl font-bold ${getStatusColor()}`}>
          {power.toFixed(0)}W
          <span className="text-sm font-normal text-muted-foreground ml-1">
            W
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">V:</span>{" "}
            {voltage.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              V
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">A:</span>{" "}
            {current.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              A
            </span>
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
