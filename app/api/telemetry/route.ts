import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { TelemetryData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Connect to the Neon database
    const sql = neon(process.env.DATABASE_URL as string);

    // Parse the incoming telemetry data
    const telemetryData: TelemetryData = await request.json();

    // Validate the data structure
    if (!isValidTelemetryData(telemetryData)) {
      return NextResponse.json(
        { error: "Invalid telemetry data format" },
        { status: 400 },
      );
    }

    // Insert data into your Neon Postgres database
    await sql`
      INSERT INTO telemetry (
        gps_rx_time, gps_longitude, gps_latitude, gps_speed, gps_num_sats,
        battery_sup_bat_v, battery_main_bat_v, battery_main_bat_c,
        battery_low_cell_v, battery_high_cell_v, battery_high_cell_t,
        battery_cell_idx_low_v, battery_cell_idx_high_t,
        mppt1_input_v, mppt1_input_c, mppt1_output_v, mppt1_output_c,
        mppt2_input_v, mppt2_input_c, mppt2_output_v, mppt2_output_c,
        mppt3_input_v, mppt3_input_c, mppt3_output_v, mppt3_output_c,
        mitsuba_voltage, mitsuba_current, mitsuba_error_frame,
        created_at
      ) VALUES (
        ${telemetryData.gps.rx_time},
        ${telemetryData.gps.longitude},
        ${telemetryData.gps.latitude},
        ${telemetryData.gps.speed},
        ${telemetryData.gps.num_sats},
        ${telemetryData.battery.sup_bat_v},
        ${telemetryData.battery.main_bat_v},
        ${telemetryData.battery.main_bat_c},
        ${telemetryData.battery.low_cell_v},
        ${telemetryData.battery.high_cell_v},
        ${telemetryData.battery.high_cell_t},
        ${telemetryData.battery.cell_idx_low_v},
        ${telemetryData.battery.cell_idx_high_t},
        ${telemetryData.mppt1.input_v},
        ${telemetryData.mppt1.input_c},
        ${telemetryData.mppt1.output_v},
        ${telemetryData.mppt1.output_c},
        ${telemetryData.mppt2.input_v},
        ${telemetryData.mppt2.input_c},
        ${telemetryData.mppt2.output_v},
        ${telemetryData.mppt2.output_c},
        ${telemetryData.mppt3.input_v},
        ${telemetryData.mppt3.input_c},
        ${telemetryData.mppt3.output_v},
        ${telemetryData.mppt3.output_c},
        ${telemetryData.mitsuba.voltage},
        ${telemetryData.mitsuba.current},
        ${telemetryData.mitsuba.error_frame},
        NOW()
      )
    `;

    return NextResponse.json(
      { success: true, message: "Telemetry data stored successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error storing telemetry data:", error);
    return NextResponse.json(
      { error: "Failed to store telemetry data" },
      { status: 500 },
    );
  }
}

function isValidTelemetryData(data: any): data is TelemetryData {
  return (
    data &&
    data.gps &&
    typeof data.gps.longitude === "number" &&
    data.battery &&
    typeof data.battery.sup_bat_v === "number" &&
    data.mppt1 &&
    typeof data.mppt1.input_v === "number" &&
    data.mppt2 &&
    typeof data.mppt2.input_v === "number" &&
    data.mppt3 &&
    typeof data.mppt3.input_v === "number" &&
    data.mitsuba &&
    typeof data.mitsuba.voltage === "number"
  );
}
