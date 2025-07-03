import { TelemetryData, StatusType, MPPTData } from './types';

export function ieee32ToFloat(intValue: number): number {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, intValue, false); // false for big-endian
  return view.getFloat32(0, false);
}

export function mapTelemetryData(data: any): TelemetryData {
  return {
    gps: {
      rx_time: data.gps_rx_time,
      longitude: data.gps_longitude,
      latitude: data.gps_latitude,
      speed: data.gps_speed,
      num_sats: data.gps_num_sats,
    },
    battery: {
      sup_bat_v: data.battery_sup_bat_v,
      main_bat_v: data.battery_main_bat_v,
      main_bat_c: data.battery_main_bat_c,
      low_cell_v: data.battery_low_cell_v,
      high_cell_v: data.battery_high_cell_v,
      high_cell_t: data.battery_high_cell_t,
      cell_idx_low_v: data.battery_cell_idx_low_v,
      cell_idx_high_t: data.battery_cell_idx_high_t,
    },
    mppt1: {
      input_v: data.mppt1_input_v,
      input_c: data.mppt1_input_c,
      output_v: data.mppt1_output_v,
      output_c: data.mppt1_output_c,
    },
    mppt2: {
      input_v: data.mppt2_input_v,
      input_c: data.mppt2_input_c,
      output_v: data.mppt2_output_v,
      output_c: data.mppt2_output_c,
    },
    mppt3: {
      input_v: data.mppt3_input_v,
      input_c: data.mppt3_input_c,
      output_v: data.mppt3_output_v,
      output_c: data.mppt3_output_c,
    },
    mitsuba: {
      voltage: data.mitsuba_voltage,
      current: data.mitsuba_current,
    },
  };
}

export function getSpeedStatus(data: TelemetryData): StatusType | undefined {
  return data.gps.speed > 0 ? 'good' : 'warning';
}

export function getNetPowerStatus(data: TelemetryData): StatusType | undefined {
  const netPower = calculateNetPower(data);
  return netPower > 0 ? 'good' : 'critical';
}

export function getMotorStatus(data: TelemetryData): StatusType | undefined {
  return data.mitsuba.current > 0 ? 'good' : 'warning';
}

export function calculateNetPower(data: TelemetryData): number {
  const solarPower = calculateTotalSolarPower(data);
  const motorPower = calculateMotorPower(data);
  return solarPower - motorPower;
}

export function calculateMotorPower(data: TelemetryData): number {
  return data.mitsuba.voltage * data.mitsuba.current;
}

export function calculateTotalSolarPower(data: TelemetryData): number {
  return (
    data.mppt1.output_v * data.mppt1.output_c +
    data.mppt2.output_v * data.mppt2.output_c +
    data.mppt3.output_v * data.mppt3.output_c
  );
}

export function calculateAverageSolarVoltage(data: TelemetryData): number {
  return (
    (data.mppt1.input_v + data.mppt2.input_v + data.mppt3.input_v) / 3
  );
}

export function calculateTotalSolarCurrent(data: TelemetryData): number {
  return (
    data.mppt1.input_c + data.mppt2.input_c + data.mppt3.input_c
  );
}

export function calculateMPPTPower(voltage: number, current: number): number {
  return voltage * current;
}

export function getBatteryStatus(voltage: number, type: string): StatusType | undefined {
  const lowVoltageThreshold = 3.0; // Example threshold
  const highVoltageThreshold = 4.2; // Example threshold

  if (voltage < lowVoltageThreshold) {
    return 'critical';
  } else if (voltage > highVoltageThreshold) {
    return 'warning';
  } else {
    return 'good';
  }
}

export function getCellStatus(cellVoltage: number): StatusType | undefined {
  const lowVoltageThreshold = 3.0; // Example threshold
  const highVoltageThreshold = 4.2; // Example threshold

  if (cellVoltage < lowVoltageThreshold) {
    return 'critical';
  } else if (cellVoltage > highVoltageThreshold) {
    return 'warning';
  } else {
    return 'good';
  }
}

export function calculateStateOfCharge(data: TelemetryData): number {
  // Simplified SOC calculation based on voltage
  // This is a placeholder - actual SOC calculation would be more complex
  const nominalVoltage = 48; // Example nominal battery voltage
  return Math.min(100, Math.max(0, (data.battery.main_bat_v / nominalVoltage) * 100));
}

export function getCustomValue(data: TelemetryData, path: string): number | undefined {
  switch (path) {
    case 'custom.soc':
      return calculateStateOfCharge(data);
    case 'custom.motorPower':
      return calculateMotorPower(data);
    default:
      return undefined;
  }
}
