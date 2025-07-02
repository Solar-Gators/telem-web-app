"use server";
import { neon } from "@neondatabase/serverless";
import { mapTelemetryData } from "./telemetry-utils";
import { TelemetryData } from "./types";
import { useSession } from "next-auth/react";
import { auth } from "@/auth";
import { AuthError } from "next-auth";

interface TelemetryStatValue {
  value: any;
  timestamp: Date;
}

export async function fetchLatestTelemetryData() {
  try {
    const session = await auth();
    if (!session || !session.user.is_verified) {
      throw new AuthError("User not authenticated or not verified");
    }
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

/**
 * Fetches telemetry data within a specified date range
 * @param startDate - The start date for the range (inclusive)
 * @param endDate - The end date for the range (inclusive)
 * @param statField - Optional specific database field to extract (e.g., 'battery_main_bat_v', 'gps_speed')
 * @returns Array of TelemetryData objects if no statField specified, or array of TelemetryStatValue objects if statField specified
 *
 * @example
 * // Get all telemetry data for the last 24 hours
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
 * const now = new Date();
 * const allData = await fetchTelemetryDataInRange(yesterday, now);
 *
 * @example
 * // Get only battery voltage readings for the last hour
 * const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
 * const now = new Date();
 * const voltageData = await fetchTelemetryDataInRange(hourAgo, now, 'battery_main_bat_v');
 */
export async function fetchTelemetryDataInRange(
  startDate: Date,
  endDate: Date,
  statField?: string
): Promise<TelemetryData[] | TelemetryStatValue[] | null> {
  try {
    const session = await auth();
    if (!session || !session.user.is_verified) {
      throw new AuthError("User not authenticated or not verified");
    }
    // Connect to the Neon database
    const sql = neon(process.env.DATABASE_URL || "");

    // Fetch all data in the date range
    const result = await sql`
      SELECT * 
      FROM telemetry 
      WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()} 
      ORDER BY created_at ASC
    `;

    if (result.length === 0) {
      return [];
    }

    // If a specific stat field is requested, extract only that field with timestamps
    if (statField) {
      return result.map((row) => ({
        value: (row as any)[statField],
        timestamp: row.created_at,
      })) as TelemetryStatValue[];
    }

    // Otherwise, map all data to TelemetryData format
    return result.map((row) => mapTelemetryData(row));
  } catch (error) {
    console.error("Error fetching telemetry data in range:", error);
    return null;
  }
}
