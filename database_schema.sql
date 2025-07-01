-- Database schema for telemetry data
-- Run this SQL in your Neon database console to create the table

CREATE TABLE IF NOT EXISTS telemetry (
  id SERIAL PRIMARY KEY,
  
  -- GPS data
  gps_rx_time BIGINT NOT NULL,
  gps_longitude REAL NOT NULL,
  gps_latitude REAL NOT NULL,
  gps_speed REAL NOT NULL,
  gps_num_sats INTEGER NOT NULL,
  
  -- Battery data
  battery_sup_bat_v REAL NOT NULL,
  battery_main_bat_v REAL NOT NULL,
  battery_main_bat_c REAL NOT NULL,
  battery_low_cell_v REAL NOT NULL,
  battery_high_cell_v REAL NOT NULL,
  battery_high_cell_t REAL NOT NULL,
  battery_cell_idx_low_v INTEGER NOT NULL,
  battery_cell_idx_high_t INTEGER NOT NULL,
  
  -- MPPT1 data
  mppt1_input_v REAL NOT NULL,
  mppt1_input_c REAL NOT NULL,
  mppt1_output_v REAL NOT NULL,
  mppt1_output_c REAL NOT NULL,
  
  -- MPPT2 data
  mppt2_input_v REAL NOT NULL,
  mppt2_input_c REAL NOT NULL,
  mppt2_output_v REAL NOT NULL,
  mppt2_output_c REAL NOT NULL,
  
  -- MPPT3 data
  mppt3_input_v REAL NOT NULL,
  mppt3_input_c REAL NOT NULL,
  mppt3_output_v REAL NOT NULL,
  mppt3_output_c REAL NOT NULL,
  
  -- Mitsuba motor data
  mitsuba_voltage REAL NOT NULL,
  mitsuba_current REAL NOT NULL,
  mitsuba_error_frame INTEGER NOT NULL,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create an index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry(created_at DESC);