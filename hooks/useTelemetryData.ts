"use client";

import { useEffect, useState } from "react";
import { TelemetryData } from "@/lib/types";

// Mock telemetry data - replace with your actual data source
const useTelemetryData = () => {
  const [data, setData] = useState<TelemetryData>({
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
      error_frame: 0,
    },
  });

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setData((prev) => ({
        gps: {
          ...prev.gps,
          speed: Math.max(0, prev.gps.speed + (Math.random() - 0.5) * 5),
          num_sats: Math.max(
            0,
            Math.min(
              12,
              prev.gps.num_sats + Math.floor((Math.random() - 0.5) * 3),
            ),
          ),
          rx_time: Date.now(),
        },
        battery: {
          ...prev.battery,
          sup_bat_v: Math.max(
            0,
            prev.battery.sup_bat_v + (Math.random() - 0.5) * 0.5,
          ),
          main_bat_v: Math.max(
            0,
            prev.battery.main_bat_v + (Math.random() - 0.5) * 2,
          ),
          main_bat_c: Math.max(
            0,
            prev.battery.main_bat_c + (Math.random() - 0.5) * 3,
          ),
          low_cell_v: Math.max(
            0,
            prev.battery.low_cell_v + (Math.random() - 0.5) * 0.1,
          ),
          high_cell_v: Math.max(
            0,
            prev.battery.high_cell_v + (Math.random() - 0.5) * 0.1,
          ),
          high_cell_t: Math.max(
            0,
            prev.battery.high_cell_t + (Math.random() - 0.5) * 2,
          ),
        },
        mppt1: {
          input_v: Math.max(0, prev.mppt1.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt1.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(
            0,
            prev.mppt1.output_v + (Math.random() - 0.5) * 1,
          ),
          output_c: Math.max(
            0,
            prev.mppt1.output_c + (Math.random() - 0.5) * 1,
          ),
        },
        mppt2: {
          input_v: Math.max(0, prev.mppt2.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt2.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(
            0,
            prev.mppt2.output_v + (Math.random() - 0.5) * 1,
          ),
          output_c: Math.max(
            0,
            prev.mppt2.output_c + (Math.random() - 0.5) * 1,
          ),
        },
        mppt3: {
          input_v: Math.max(0, prev.mppt3.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt3.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(
            0,
            prev.mppt3.output_v + (Math.random() - 0.5) * 1,
          ),
          output_c: Math.max(
            0,
            prev.mppt3.output_c + (Math.random() - 0.5) * 1,
          ),
        },
        mitsuba: {
          voltage: Math.max(
            0,
            prev.mitsuba.voltage + (Math.random() - 0.5) * 2,
          ),
          current: Math.max(
            0,
            prev.mitsuba.current + (Math.random() - 0.5) * 5,
          ),
          error_frame: Math.random() > 0.95 ? 1 : 0, // Occasional error
        },
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return data;
};

export default useTelemetryData;
