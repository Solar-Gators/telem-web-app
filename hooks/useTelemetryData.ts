"use client";

import { useEffect, useState } from "react";
import { TelemetryData } from "@/lib/types";

const useTelemetryData = () => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch("/api/telemetry/latest");

        if (!response.ok) {
          if (response.status === 404) {
            // No data yet, fall back to mock data for demo purposes
            setData(getMockData());
            setError("No telemetry data received yet. Showing mock data.");
          } else {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }
        } else {
          const latestData = await response.json();
          setData(latestData);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching telemetry data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        // Fall back to mock data on error
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial data
    fetchLatestData();

    // Set up polling for real-time updates every 2 seconds
    const interval = setInterval(fetchLatestData, 2000);

    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

// Mock data fallback for when no real data is available
const getMockData = (): TelemetryData => ({
  gps: {
    rx_time: Date.now(),
    longitude: -122.4194,
    latitude: 37.7749,
    speed: 45.2,
    num_sats: 8,
  },
  battery: {
    sup_bat_v: 12.4,
    main_bat_v: 48.6,
    main_bat_c: 25.3,
    low_cell_v: 3.2,
    high_cell_v: 3.8,
    high_cell_t: 32.5,
    cell_idx_low_v: 4,
    cell_idx_high_t: 12,
  },
  mppt1: {
    input_v: 42.1,
    input_c: 8.5,
    output_v: 48.2,
    output_c: 7.2,
  },
  mppt2: {
    input_v: 41.8,
    input_c: 7.9,
    output_v: 48.1,
    output_c: 6.8,
  },
  mppt3: {
    input_v: 42.3,
    input_c: 8.1,
    output_v: 48.3,
    output_c: 7.0,
  },
  mitsuba: {
    voltage: 48.2,
    current: 22.5,
  },
});

export default useTelemetryData;
