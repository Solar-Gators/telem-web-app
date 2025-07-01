'use server'
import { neon } from "@neondatabase/serverless";
import { TelemetryData } from "@/lib/types";

export async function fetchLatestTelemetryData() {
  try {
    // Connect to the Neon database
    const sql = neon(process.env.DATABASE_URL || "");

    // Fetch the latest telemetry data
    const result = await sql`
      SELECT * FROM telemetry
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      throw new Error("No telemetry data found");
    }

    const data = result[0];

    const telemetryData: TelemetryData = {
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

    return telemetryData;
  } catch (error) {
    console.error("Error fetching latest telemetry data:", error);
    return null;
  }
}

