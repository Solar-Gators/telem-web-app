import { StatusType, TelemetryData } from "./types";

// Status functions
export const getSpeedStatus = (speed: number): StatusType => {
  if (speed > 80) return "critical";
  if (speed > 60) return "warning";
  return "good";
};

export const getBatteryStatus = (
  voltage: number,
  type: "main" | "supplemental",
): StatusType => {
  if (type === "main") {
    if (voltage < 44) return "critical";
    if (voltage < 46) return "warning";
    return "good";
  } else {
    if (voltage < 11) return "critical";
    if (voltage < 11.8) return "warning";
    return "good";
  }
};

export const getCellStatus = (
  lowV: number,
  highV: number,
  temp: number,
): StatusType => {
  if (lowV < 3.0 || highV > 4.0 || temp > 45) return "critical";
  if (lowV < 3.2 || highV > 3.9 || temp > 35) return "warning";
  return "good";
};

export const getNetPowerStatus = (power: number): StatusType => {
  if (power > 0) return "good";
  if (power > -500) return "warning";
  return "critical";
};

export const getMotorStatus = (current: number): StatusType => {
  // Motor status based on current draw
  if (current > 50) return "critical"; // High current draw
  if (current > 40) return "warning"; // Moderate current draw
  return "good";
};

// Calculation functions
export const calculateTotalSolarPower = (data: TelemetryData): number => {
  return (
    data.mppt1.input_v * data.mppt1.input_c +
    data.mppt2.input_v * data.mppt2.input_c +
    data.mppt3.input_v * data.mppt3.input_c
  );
};

export const calculateMotorPower = (data: TelemetryData): number => {
  return data.mitsuba.voltage * data.mitsuba.current;
};

export const calculateBatteryPower = (data: TelemetryData): number => {
  return data.battery.main_bat_v * data.battery.main_bat_c;
};

export const calculateNetPower = (data: TelemetryData): number => {
  const totalSolarPower = calculateTotalSolarPower(data);
  const motorPower = calculateMotorPower(data);
  return totalSolarPower - motorPower;
};

export const calculateAverageSolarVoltage = (data: TelemetryData): number => {
  return (data.mppt1.input_v + data.mppt2.input_v + data.mppt3.input_v) / 3;
};

export const calculateTotalSolarCurrent = (data: TelemetryData): number => {
  return data.mppt1.input_c + data.mppt2.input_c + data.mppt3.input_c;
};

export const calculateMPPTPower = (
  voltage: number,
  current: number,
): number => {
  return voltage * current;
};
