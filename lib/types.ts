import { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

// Type definitions for telemetry data
export interface TelemetryData<T> {
  gps?: {
    rx_time: T;
    longitude: T;
    latitude: T;
    speed: T;
    num_sats: T;
  };
  battery: {
    sup_bat_v: T;
    main_bat_v: T;
    main_bat_c: T;
    low_cell_v: T;
    high_cell_v: T;
    high_cell_t: T;
    cell_idx_low_v: T;
    cell_idx_high_t: T;
  };
  mppt1: {
    input_v: T;
    input_c: T;
    output_v: T;
    output_c: T;
  };
  mppt2: {
    input_v: T;
    input_c: T;
    output_v: T;
    output_c: T;
  };
  mppt3: {
    input_v: T;
    input_c: T;
    output_v: T;
    output_c: T;
  };
  mitsuba?: {
    voltage: T;
    current: T;
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
