export type VehicleState = 'online' | 'asleep' | 'offline' | 'in_service' | 'waking';

export interface Vehicle {
  id: number;
  vehicle_id: number;
  vin: string;
  display_name: string;
  state: VehicleState;
  in_service: boolean;
  id_s: string;
  calendar_enabled: boolean;
  api_version: number;
}

export interface ChargeState {
  battery_level: number;
  battery_range: number;
  est_battery_range: number;
  ideal_battery_range: number;
  charge_limit_soc: number;
  charge_limit_soc_max: number;
  charge_limit_soc_std: number;
  charging_state: 'Charging' | 'Stopped' | 'Complete' | 'Disconnected' | 'NoPower' | 'Starting';
  charge_port_door_open: boolean;
  charge_port_latch: 'Engaged' | 'Disengaged' | 'Blocking' | null;
  charge_rate: number;
  charge_current_request: number;
  charge_current_request_max: number;
  charge_amps: number;
  charger_power: number;
  charger_voltage: number;
  charger_actual_current: number;
  minutes_to_full_charge: number;
  time_to_full_charge: number;
  charge_energy_added: number;
  charge_miles_added_rated: number;
  fast_charger_present: boolean;
  fast_charger_type: string | null;
  conn_charge_cable: string;
  scheduled_charging_mode: 'Off' | 'StartAt' | 'DepartBy';
  scheduled_charging_start_time: number | null;
  scheduled_departure_time: number | null;
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
  defrost_mode: number;
  is_front_defroster_on: boolean;
  is_rear_defroster_on: boolean;
  steering_wheel_heater: boolean;
  wiper_blade_heater: boolean;
  side_mirror_heaters: boolean;
  timestamp: number;
}

export interface DriveState {
  gps_as_of: number;
  heading: number;
  latitude: number | null;
  longitude: number | null;
  native_latitude: number | null;
  native_longitude: number | null;
  native_type: string;
  power: number;
  shift_state: 'P' | 'R' | 'N' | 'D' | null;
  speed: number | null;
  timestamp: number;
}

export interface VehicleStateData {
  api_version: number;
  autopark_state_v3: string | null;
  car_version: string;
  center_display_state: number;
  df: number;
  dr: number;
  fd_window: number;
  fp_window: number;
  ft: number;
  homelink_device_count: number;
  homelink_nearby: boolean;
  is_user_present: boolean;
  locked: boolean;
  media_info: { a2dp_source_name: string } | null;
  notifications_supported: boolean;
  odometer: number;
  parsed_calendar_supported: boolean;
  pf: number;
  pr: number;
  rd_window: number;
  remote_start: boolean;
  remote_start_enabled: boolean;
  rp_window: number;
  rt: number;
  santa_mode: number;
  sentry_mode: boolean;
  sentry_mode_available: boolean;
  smart_summon_available: boolean;
  software_update: {
    download_perc: number;
    expected_duration_sec: number;
    install_perc: number;
    status: string;
    version: string;
  };
  speed_limit_mode: {
    active: boolean;
    current_limit_mph: number;
    max_limit_mph: number;
    min_limit_mph: number;
    pin_code_set: boolean;
  };
  timestamp: number;
  tpms_pressure_fl: number | null;
  tpms_pressure_fr: number | null;
  tpms_pressure_rl: number | null;
  tpms_pressure_rr: number | null;
  valet_mode: boolean;
  vehicle_name: string;
}

export interface VehicleConfig {
  can_accept_navigation_requests: boolean;
  can_actuate_trunks: boolean;
  car_special_type: string;
  car_type: string;
  charge_port_type: string;
  default_charge_to_max: boolean;
  driver_assist: string;
  ece_restrictions: boolean;
  efficiency_package: string;
  exterior_color: string;
  exterior_trim: string;
  exterior_trim_override: string;
  has_air_suspension: boolean;
  has_ludicrous_mode: boolean;
  has_seat_cooling: boolean;
  key_version: number;
  motorized_charge_port: boolean;
  plg: boolean;
  pws: boolean;
  rear_drive_unit: string;
  roof_color: string;
  seat_type: number | null;
  spoiler_type: string;
  sun_roof_installed: number | null;
  supports_qr_pairing: boolean;
  trim_badging: string;
  use_range_badging: boolean;
  utc_offset: number;
  webcam_available: boolean;
  webcam_supported: boolean;
  wheel_type: string;
}

export interface FullVehicleData {
  id: number;
  user_id: number;
  vehicle_id: number;
  vin: string;
  display_name: string;
  state: VehicleState;
  in_service: boolean;
  charge_state: ChargeState;
  climate_state: ClimateState;
  drive_state: DriveState;
  vehicle_state: VehicleStateData;
  vehicle_config: VehicleConfig;
}

export interface CommandResult {
  result: boolean;
  reason: string;
}
