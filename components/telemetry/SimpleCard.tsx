import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusType } from "@/lib/types";
import { LucideIcon } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

interface SimpleCardProps {
  title: string;
  value?: number;
  unit: string;
  icon: LucideIcon;
  status?: StatusType;
  subtitle?: string;
  subtitleUnit?: string;
  lastUpdated?: Date;
  subtitleFullSize?: boolean;
  className?: string;
}

export default function SimpleCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  subtitle,
  subtitleUnit,
  lastUpdated,
  subtitleFullSize,
  className,
}: SimpleCardProps) {
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-2">
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
      <CardContent className="relative">
        <div className={`text-xl font-bold ${getStatusColor()}`}>
          {value?.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {unit}
          </span>
        </div>
        <div className={`mt-1 ${subtitleFullSize ? "text-xl" : "text-xs"}`}>
          {subtitle}
          <span
            className={`font-normal text-muted-foreground ml-1 ${subtitleFullSize && "text-sm"}`}
          >
            {subtitleUnit}
          </span>
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
