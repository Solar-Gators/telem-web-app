import Image from "next/image";
import ClientOnly from "@/components/ClientOnly";

interface HeaderProps {
  lastUpdated?: Date;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col items-start gap-2 mb-4">
        <ClientOnly
          fallback={
            <div className="w-[200px] h-[59px] bg-muted animate-pulse rounded" />
          }
        >
          <Image
            src="/images/sg-logo.png"
            alt="Solar Gators Logo"
            width={200}
            height={59}
            className="h-auto"
            priority
            suppressHydrationWarning
            style={{ color: "transparent" }}
          />
          {lastUpdated && (
            <p className="absolute text-muted-foreground text-xs right-4">
              Last packet: {lastUpdated?.toLocaleTimeString()}
            </p>
          )}
        </ClientOnly>
        <p className="text-muted-foreground">Telemetry Monitoring Dashboard</p>
      </div>
    </div>
  );
}
