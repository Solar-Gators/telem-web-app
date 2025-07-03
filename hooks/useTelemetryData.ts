import { useEffect, useState } from "react";
import { TelemetryData } from "@/lib/types";
import { fetchLatestTelemetryData } from "@/lib/db-utils";

const useTelemetryData = () => {
  const [data, setData] = useState<TelemetryData<number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const latestData = await fetchLatestTelemetryData();
        setData(latestData || null);
        setError(null);
      } catch (error) {
        console.error("Error fetching telemetry data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
  }, []);

  return { data, loading, error };
};

export default useTelemetryData;
