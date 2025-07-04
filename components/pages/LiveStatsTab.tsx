import { Gauge, Zap, Car, Sun } from "lucide-react";
import { TelemetryData } from "@/lib/types";
import {
  getSpeedStatus,
  getNetPowerStatus,
  getMotorStatus,
  calculateNetPower,
  calculateMotorPower,
  calculateTotalSolarPower,
  calculateAverageSolarVoltage,
  calculateTotalSolarCurrent,
} from "@/lib/telemetry-utils";
import PowerCard from "../telemetry/PowerCard";
import SimpleCard from "../telemetry/SimpleCard";
import MPPTSection from "../telemetry/MPPTSection";
import BatterySection from "../telemetry/BatterySection";
import { useEffect } from "react";

interface LiveStatsTabProps {
  telemetryData: TelemetryData<number>;
  dateData: TelemetryData<Date>;
}

export default function LiveStatsTab({
  telemetryData,
  dateData,
}: LiveStatsTabProps) {
  const totalSolarPower = calculateTotalSolarPower(telemetryData);
  const motorPower = calculateMotorPower(telemetryData);
  const netPower = calculateNetPower(telemetryData);

  const batteryLastUpdated =
    dateData.battery.main_bat_v > dateData.battery.main_bat_c
      ? dateData.battery.main_bat_v
      : dateData.battery.main_bat_c;

  return (
    <div className="space-y-6">
      {/* Top Row - Speed, Net Power, Motor Power */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SimpleCard
          title="Vehicle Speed"
          value={telemetryData.gps.speed}
          unit="mph"
          icon={Gauge}
          status={getSpeedStatus(telemetryData)}
          lastUpdated={dateData.gps.rx_time}
        />
        <PowerCard
          title="Net Power"
          voltage={telemetryData.battery.main_bat_v}
          current={netPower / telemetryData.battery.main_bat_v}
          power={netPower}
          icon={Zap}
          status={getNetPowerStatus(telemetryData)}
          lastUpdated={dateData.battery.main_bat_v}
        />
        <PowerCard
          title="Motor Power"
          voltage={telemetryData.mitsuba.voltage}
          current={telemetryData.mitsuba.current}
          power={motorPower}
          icon={Car}
          status={getMotorStatus(telemetryData)}
          lastUpdated={dateData.mppt1.input_v}
        />
        <PowerCard
          title="Total Solar Input"
          voltage={calculateAverageSolarVoltage(telemetryData)}
          current={calculateTotalSolarCurrent(telemetryData)}
          power={totalSolarPower}
          icon={Sun}
          status="good"
          lastUpdated={dateData.battery.main_bat_v}
        />
      </div>

      {/* MPPT Controllers */}
      <MPPTSection
        mppt1={telemetryData.mppt1}
        mppt2={telemetryData.mppt2}
        mppt3={telemetryData.mppt3}
      />

      {/* Battery Systems */}
      <BatterySection
        batteryData={telemetryData.battery}
        lastUpdated={batteryLastUpdated}
      />
    </div>
  );
}
