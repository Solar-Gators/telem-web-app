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
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial data
    fetchLatestData();

    // const interval = setInterval(fetchLatestData, 2000);

    // return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};

export default useTelemetryData;
