import { TelemetryData } from "./types";

export interface SelectOption {
  value: string;
  label: string;
  dataPath: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

// Configuration for telemetry data fields
export const TELEMETRY_FIELD_CONFIG: Record<
  string,
  { label: string; fields: Record<string, string> }
> = {
  battery: {
    label: "Battery",
    fields: {
      main_bat_v: "Main Battery Voltage",
      main_bat_c: "Main Battery Current",
      low_cell_v: "Low Cell Voltage",
      high_cell_v: "High Cell Voltage",
      high_cell_t: "High Cell Temp",
    },
  },
  mppt1: {
    label: "MPPT 1",
    fields: {
      input_v: "Voltage Input (MPPT 1)",
      output_v: "Voltage Output (MPPT 1)",
      input_c: "Current Input (MPPT 1)",
      output_c: "Current Output (MPPT 1)",
    },
  },
  mppt2: {
    label: "MPPT 2",
    fields: {
      input_v: "Voltage Input (MPPT 2)",
      output_v: "Voltage Output (MPPT 2)",
      input_c: "Current Input (MPPT 2)",
      output_c: "Current Output (MPPT 2)",
    },
  },
  mppt3: {
    label: "MPPT 3",
    fields: {
      input_v: "Voltage Input (MPPT 3)",
      output_v: "Voltage Output (MPPT 3)",
      input_c: "Current Input (MPPT 3)",
      output_c: "Current Output (MPPT 3)",
    },
  },
};

// Custom calculated fields
export const CUSTOM_FIELD_CONFIG: SelectGroup = {
  label: "Derived",
  options: [
    {
      value: "mppt_sum",
      label: "Total MPPT Voltage Output",
      dataPath: "custom.mppt_sum",
    },
    /*     {
      value: "net_power",
      label: "Net Power",
      dataPath: "custom.net_power",
    }, */
    //{
    //  value: "motor_power",
    //  label: "Motor Power",
    //  dataPath: "custom.motor_power",
    //},
    {
      value: "total_solar_power",
      label: "Total Solar Power",
      dataPath: "custom.total_solar_power",
    },
    {
      value: "battery_power",
      label: "Net Power",
      dataPath: "custom.battery_power",
    },
    {
      value: "battery_energy_ah",
      label: "Battery Remaining Energy (Ah)",
      dataPath: "custom.battery_energy_ah",
    },
    {
      value: "battery_soc",
      label: "Battery SOC (%)",
      dataPath: "custom.battery_soc",
    },
    {
      value: "motor_power_consumption",
      label: "Motor Power Consumption",
      dataPath: "custom.motor_power_consumption",
    },
  ],
};

export function generateSelectGroups(): SelectGroup[] {
  const groups: SelectGroup[] = [];

  // Generate groups from telemetry field config
  Object.entries(TELEMETRY_FIELD_CONFIG).forEach(([category, config]) => {
    const options: SelectOption[] = Object.entries(config.fields).map(
      ([field, label]) => ({
        value: `${category}.${field}`,
        label,
        dataPath: `${category}.${field}`,
      }),
    );

    groups.push({
      label: config.label,
      options,
    });
  });

  // Add custom fields
  groups.push(CUSTOM_FIELD_CONFIG);

  return groups;
}

export function getValueFromPath(
  data: TelemetryData<number>,
  path: string,
  value?: string,
): number | undefined {
  // Handle special cases based on the select value
  if (value === "kph") {
    const speedMph = getValueFromPath(data, "gps.speed");
    return speedMph ? speedMph * 1.60934 : undefined;
  }

  const pathParts = path.split(".");
  let result: any = data;

  for (const part of pathParts) {
    if (result && typeof result === "object" && part in result) {
      result = result[part];
    } else {
      return undefined;
    }
  }

  return typeof result === "number" ? result : undefined;
}
