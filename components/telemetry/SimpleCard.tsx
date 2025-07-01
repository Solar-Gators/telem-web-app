import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusType } from "@/lib/types";
import { LucideIcon } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

interface SimpleCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  status?: StatusType;
  subtitle?: string;
}

export default function SimpleCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  subtitle,
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
      <CardContent>
        <div className={`text-2xl font-bold ${getStatusColor()}`}>
          {value.toFixed(1)}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            {unit}
          </span>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
