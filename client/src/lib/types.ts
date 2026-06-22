export interface ChargeState {
  battery_level: number;
  battery_range: number;
  charge_limit_soc: number;
  charging_state: 'Charging' | 'Stopped' | 'Complete' | 'Disconnected' | 'NoPower' | 'Starting';
  charge_port_door_open: boolean;
  charge_rate: number;
  charger_power: number;
  minutes_to_full_charge: number;
  time_to_full_charge: number;
  charge_energy_added: number;
  fast_charger_present: boolean;
  fast_charger_type: string | null;
  scheduled_charging_mode: string;
  scheduled_charging_start_time: number | null;
  timestamp: number;
}

export interface ClimateState {
  inside_temp: number | null;
  outside_temp: number | null;
  driver_temp_setting: number;
  passenger_temp_setting: number;
  is_climate_on: boolean;
  is_auto_conditioning_on: boolean;
  fan_status: number;
  seat_heater_left: number;
  seat_heater_right: number;
  seat_heater_rear_left: number;
  seat_heater_rear_center: number;
  seat_heater_rear_right: number;
  is_front_defroster_on: boolean;
  is_rear_defroster_on: boolean;
  steering_wheel_heater: boolean;
  timestamp: number;
}

export interface DriveState {
  heading: number;
  latitude: number | null;
  longitude: number | null;
  power: number;
  shift_state: 'P' | 'R' | 'N' | 'D' | null;
  speed: number | null;
  timestamp: number;
}

export interface VehicleStateData {
  car_version: string;
  df: number; dr: number; pf: number; pr: number;
  ft: number; rt: number;
  fd_window: number; fp_window: number; rd_window: number; rp_window: number;
  locked: boolean;
  odometer: number;
  remote_start: boolean;
  sentry_mode: boolean;
  sentry_mode_available: boolean;
  software_update: { status: string; version: string; download_perc: number; install_perc: number };
  tpms_pressure_fl: number | null;
  tpms_pressure_fr: number | null;
  tpms_pressure_rl: number | null;
  tpms_pressure_rr: number | null;
  valet_mode: boolean;
  vehicle_name: string;
  timestamp: number;
}

export interface VehicleConfig {
  car_type: string;
  exterior_color: string;
  trim_badging: string;
  roof_color: string;
  wheel_type: string;
}

export interface FullVehicleData {
  id: number;
  vehicle_id: number;
  vin: string;
  display_name: string;
  state: string;
  in_service: boolean;
  charge_state: ChargeState;
  climate_state: ClimateState;
  drive_state: DriveState;
  vehicle_state: VehicleStateData;
  vehicle_config: VehicleConfig;
}
