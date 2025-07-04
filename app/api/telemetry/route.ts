import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { TelemetryData } from "@/lib/types";

export async function POST(request: NextRequest) {
  const json_obj = await request.json();

  try {
    const apiKey = request.headers.get("auth-key");
    if (!apiKey || apiKey !== process.env.NOTEHUB_AUTH_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid auth key" },
        { status: 401 },
      );
    }

    const telemetryData: TelemetryData<number> = json_obj["body"];

    telemetryData.battery.sup_bat_v /= 1000;
    telemetryData.battery.main_bat_v /= 1000;
    telemetryData.battery.low_cell_v /= 1000;
    telemetryData.battery.high_cell_v /= 1000;

    const sql = neon(process.env.DATABASE_URL as string);

    await sql`
      INSERT INTO telemetry (
        gps_rx_time, gps_longitude, gps_latitude, gps_speed, gps_num_sats,
        battery_sup_bat_v, battery_main_bat_v, battery_main_bat_c,
        battery_low_cell_v, battery_high_cell_v, battery_high_cell_t,
        battery_cell_idx_low_v, battery_cell_idx_high_t,
        mppt1_input_v, mppt1_input_c, mppt1_output_v, mppt1_output_c,
        mppt2_input_v, mppt2_input_c, mppt2_output_v, mppt2_output_c,
        mppt3_input_v, mppt3_input_c, mppt3_output_v, mppt3_output_c,
        mitsuba_voltage, mitsuba_current,
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
        NOW()
      )
    `;

    console.log("Telemetry data stored.", telemetryData);

    return NextResponse.json(
      { success: true, message: "Telemetry data stored successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error storing telemetry data:", error, json_obj);
    return NextResponse.json(
      { error: "Failed to store telemetry data" },
      { status: 500 },
    );
  }
}
