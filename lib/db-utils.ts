'use server'
import { neon } from "@neondatabase/serverless";
import { mapTelemetryData } from "./telemetry-utils";

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

    return mapTelemetryData(result[0]);
  } catch (error) {
    console.error("Error fetching latest telemetry data:", error);
    return null;
  }
}