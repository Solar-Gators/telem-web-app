"use server";
import { neon } from "@neondatabase/serverless";
import { mapTelemetryData, telemetryFields } from "./telemetry-utils";
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
    // Authentication logic can be re-enabled here if needed
    // const session = await auth();
    // if (!session || !session.user.is_verified) {
    //   throw new AuthError("User not authenticated or not verified");
    // }

    // Connect to the Neon database. Ensure DATABASE_URL is in your environment variables.
    const sql = neon(process.env.DATABASE_URL || "");

    // Build the SELECT clause dynamically. For each field, this creates two subqueries:
    // 1. To get the latest value (prioritizing non-zero).
    // 2. To get the timestamp of that same latest value.
    const selectFields = telemetryFields
      .map(
        (field) => `
      COALESCE(
        (SELECT ${field} FROM telemetry WHERE ${field} != 0 ORDER BY created_at DESC LIMIT 1),
        (SELECT ${field} FROM telemetry ORDER BY created_at DESC LIMIT 1)
      ) AS ${field},
      COALESCE(
        (SELECT created_at FROM telemetry WHERE ${field} != 0 ORDER BY created_at DESC LIMIT 1),
        (SELECT created_at FROM telemetry ORDER BY created_at DESC LIMIT 1)
      ) AS d_${field}
    `,
      )
      .join(",\n      ");

    // Build the complete query, also fetching the ID and timestamp of the overall latest entry.
    const query = `
      SELECT
        ${selectFields},
        (SELECT id FROM telemetry ORDER BY created_at DESC LIMIT 1) AS id,
        (SELECT created_at FROM telemetry ORDER BY created_at DESC LIMIT 1) AS overall_created_at
    `;

    // Execute the dynamic query
    const result = await sql(query);

    if (result.length === 0) {
      throw new Error("No telemetry data found");
    }

    const sqlResult = result[0];
    const numericDataForMap: Record<string, any> = {};
    const dateDataForMap: Record<string, Date> = {};

    // Iterate over the defined fields to separate the numeric values and date values
    // from the flat SQL query result into two distinct objects.
    for (const field of telemetryFields) {
      numericDataForMap[field] = sqlResult[field];
      // The corresponding date is retrieved from the aliased 'd_{field}' column
      dateDataForMap[field] = new Date(sqlResult[`d_${field}`]);
    }

    // Check if any values are 0 and throw an error if found
    for (const field of telemetryFields) {
      if (numericDataForMap[field] === 0) {
        throw new Error(`Telemetry field '${field}' has a value of 0`);
      }
    }

    // Use the provided mapTelemetryData function to structure both sets of data
    const numericTelemetry = mapTelemetryData<number>(numericDataForMap);
    const dateTelemetry = mapTelemetryData<Date>(dateDataForMap);

    // Return both the numeric data and the date data
    return {
      numericData: numericTelemetry,
      dateData: dateTelemetry,
    };
  } catch (error) {
    console.error("Error fetching latest telemetry data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { error: errorMessage };
  }
}

/**
 * Fetches telemetry data within a specified date range
 * @param startDate - The start date for the range (inclusive)
 * @param endDate - The end date for the range (inclusive)
 * @param statField - Optional specific database field to extract (e.g., 'battery_main_bat_v', 'gps_speed')
 * @returns Array of TelemetryData<number> objects if no statField specified, or array of TelemetryStatValue objects if statField specified
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
  statField?: string,
): Promise<TelemetryData<number>[] | TelemetryStatValue[] | null> {
  try {
    //const session = await auth();
    //if (!session || !session.user.is_verified) {
    //  throw new AuthError("User not authenticated or not verified");
    //}

    // Connect to the Neon database
    const sql = neon(process.env.DATABASE_URL || "");

    let result;

    // If a specific stat field is requested, optimize query to select only that field and exclude zeros
    if (statField) {
      // Validate statField to prevent SQL injection - only allow alphanumeric characters and underscores
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(statField)) {
        throw new Error(`Invalid field name: ${statField}`);
      }

      // Build the query with validated field name
      const query = `
        SELECT ${statField} as value, created_at as timestamp
        FROM telemetry 
        WHERE created_at BETWEEN $1 AND $2 
        AND ${statField} != 0
        ORDER BY created_at ASC
      `;

      result = await sql(query, [
        startDate.toISOString(),
        endDate.toISOString(),
      ]);
    } else {
      // Fetch all data in the date range
      result = await sql`
        SELECT * 
        FROM telemetry 
        WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()} 
        ORDER BY created_at ASC
      `;
    }

    if (result.length === 0) {
      return [];
    }

    // If a specific stat field is requested, return the optimized query results
    if (statField) {
      return result.map((row: any) => ({
        value: row.value,
        timestamp: row.timestamp,
      })) as TelemetryStatValue[];
    }

    // Otherwise, map all data to TelemetryData format
    return result.map((row: any) => mapTelemetryData<number>(row));
  } catch (error) {
    console.error("Error fetching telemetry data in range:", error);
    return null;
  }
}
