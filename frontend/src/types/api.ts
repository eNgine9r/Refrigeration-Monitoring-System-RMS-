export type Device = {
  id: number;
  name: string;
  protocol: 'rtu' | 'tcp';
  host: string | null;
  port: number | null;
  serial_port: string | null;
  baudrate: number;
  modbus_address: number;
  polling_interval_sec: number;
  register_map: Record<string, { address: number; type: string; scale?: number }>;
  high_temp_threshold: number | null;
  low_temp_threshold: number | null;
  latest_values: Record<string, unknown> | null;
  last_seen_at: string | null;
};

export type DeviceLatest = {
  device_id: number;
  last_seen_at: string | null;
  latest_values: Record<string, unknown> | null;
};

export type HistoryPoint = {
  time: string;
  field: string;
  value: number;
};

export type Alarm = {
  id: number;
  device_id: number;
  alarm_type: 'HIGH_TEMP' | 'LOW_TEMP' | 'DEVICE_OFFLINE' | 'SENSOR_ERROR';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  severity: number;
  message: string;
  details: string | null;
  started_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};
