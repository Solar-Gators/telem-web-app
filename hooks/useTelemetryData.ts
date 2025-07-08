import { useEffect, useState } from "react";
import { TelemetryData } from "@/lib/types";
import { fetchLatestTelemetryData } from "@/lib/db-utils";

const useTelemetryData = () => {
  const [data, setData] = useState<TelemetryData<number> | null>(null);
  const [dateData, setDateData] = useState<TelemetryData<Date> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const { numericData, dateData } = await fetchLatestTelemetryData();
        setData(numericData || null);
        setDateData(dateData || null);
        setError(null);
      } catch (error) {
        console.error("Error fetching telemetry data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();

    const interval = setInterval(fetchLatestData, 2000);

    return () => clearInterval(interval);
  }, []);

  return { data, dateData, loading, error };
};

export default useTelemetryData;
