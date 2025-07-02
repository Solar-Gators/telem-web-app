import { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

// Type definitions for telemetry data
export interface TelemetryData {
  gps: {
    rx_time: number;
    longitude: number;
    latitude: number;
    speed: number;
    num_sats: number;
  };
  battery: {
    sup_bat_v: number;
    main_bat_v: number;
    main_bat_c: number;
    low_cell_v: number;
    high_cell_v: number;
    high_cell_t: number;
    cell_idx_low_v: number;
    cell_idx_high_t: number;
  };
  mppt1: {
    input_v: number;
    input_c: number;
    output_v: number;
    output_c: number;
  };
  mppt2: {
    input_v: number;
    input_c: number;
    output_v: number;
    output_c: number;
  };
  mppt3: {
    input_v: number;
    input_c: number;
    output_v: number;
    output_c: number;
  };
  mitsuba: {
    voltage: number;
    current: number;
  };
}

export interface MPPTData {
  input_v: number;
  input_c: number;
  output_v: number;
  output_c: number;
}

export type StatusType = "good" | "warning" | "critical";

export interface Location {
  lat: number;
  lng: number;
}

// Next.js Auth type extensions
declare module "next-auth" {
  interface Session {
    user: {
      is_verified?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    is_verified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    is_verified?: boolean
  }
}
