import type { Alarm, Device, DeviceLatest, HistoryPoint, LoginPayload, LoginResponse } from '@/types/api';

type MockStore = {
  devices: Device[];
  alarms: Alarm[];
  history: Record<number, HistoryPoint[]>;
};

const DEVICE_NAMES = [
  'Freezer Room 1',
  'Freezer Room 2',
  'Display Case A',
  'Display Case B',
  'Walk-in Cooler North',
  'Walk-in Cooler South',
  'Ice Cream Vault',
  'Dairy Showcase 1',
  'Dairy Showcase 2',
  'Meat Cabinet',
  'Seafood Cabinet',
  'Beverage Chiller',
];

const now = Date.now();

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function int(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, int(300, 800)));
}

function createHistory(deviceId: number, baseTemperature: number): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  for (let i = 0; i < 24 * 12; i += 1) {
    const minutesAgo = (24 * 12 - i) * 5;
    const ts = new Date(now - minutesAgo * 60_000).toISOString();
    const wave = Math.sin(i / 9) * 0.8;
    const noise = random(-0.35, 0.35);
    points.push({ time: ts, field: 'temperature', value: Number((baseTemperature + wave + noise).toFixed(2)) });
  }
  return points;
}

function buildStore(): MockStore {
  const devices: Device[] = DEVICE_NAMES.map((name, index) => {
    const id = index + 1;
    const isOffline = [4, 9].includes(id);
    const isAlarm = [3, 8, 11].includes(id);
    const baseTemperature = id % 2 === 0 ? -18 + random(-2, 2) : 4 + random(-1.2, 1.2);
    const adjusted = isAlarm ? baseTemperature + random(6, 10) : baseTemperature;

    return {
      id,
      name,
      protocol: index % 3 === 0 ? 'tcp' : 'rtu',
      host: index % 3 === 0 ? `192.168.1.${100 + id}` : null,
      port: index % 3 === 0 ? 502 : null,
      serial_port: index % 3 === 0 ? null : '/dev/ttyUSB0',
      baudrate: 9600,
      modbus_address: id,
      polling_interval_sec: 10,
      register_map: {
        temperature: { address: 100, type: 'holding', scale: 0.1 },
        alarm: { address: 200, type: 'coil' },
      },
      high_temp_threshold: id % 2 === 0 ? -12 : 8,
      low_temp_threshold: id % 2 === 0 ? -30 : 0,
      latest_values: { temperature: Number(adjusted.toFixed(1)), alarm: isAlarm },
      last_seen_at: isOffline ? new Date(now - int(8, 16) * 60_000).toISOString() : new Date(now - int(10, 70) * 1000).toISOString(),
    };
  });

  const alarms: Alarm[] = [
    {
      id: 1,
      device_id: 3,
      alarm_type: 'HIGH_TEMP',
      status: 'ACTIVE',
      severity: 3,
      message: 'Display Case A temperature too high',
      details: 'Measured 12.4°C above setpoint',
      started_at: new Date(now - 12 * 60_000).toISOString(),
      updated_at: new Date(now - 3 * 60_000).toISOString(),
      resolved_at: null,
    },
    {
      id: 2,
      device_id: 4,
      alarm_type: 'DEVICE_OFFLINE',
      status: 'ACTIVE',
      severity: 4,
      message: 'Freezer Room 2 communication lost',
      details: 'No telemetry for more than 10 minutes',
      started_at: new Date(now - 16 * 60_000).toISOString(),
      updated_at: new Date(now - 5 * 60_000).toISOString(),
      resolved_at: null,
    },
    {
      id: 3,
      device_id: 8,
      alarm_type: 'SENSOR_ERROR',
      status: 'RESOLVED',
      severity: 2,
      message: 'Dairy Showcase 1 sensor error',
      details: 'Sensor reconnected successfully',
      started_at: new Date(now - 4 * 60 * 60_000).toISOString(),
      updated_at: new Date(now - 3 * 60 * 60_000).toISOString(),
      resolved_at: new Date(now - 3 * 60 * 60_000).toISOString(),
    },
  ];

  const history: Record<number, HistoryPoint[]> = {};
  devices.forEach((device) => {
    const latest = Number(device.latest_values?.temperature ?? 0);
    history[device.id] = createHistory(device.id, latest);
  });

  return { devices, alarms, history };
}

const store = buildStore();

function jitterDevice(device: Device): Device {
  const current = Number(device.latest_values?.temperature ?? 0);
  const changed = Number((current + random(-0.3, 0.3)).toFixed(1));
  return {
    ...device,
    latest_values: { ...device.latest_values, temperature: changed },
    last_seen_at: device.last_seen_at ? new Date().toISOString() : null,
  };
}

export const mockApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await delay();
    if (payload.username === 'demo' && payload.password === 'demo') {
      return { access_token: 'mock-demo-token', token_type: 'bearer' };
    }
    throw new Error('Invalid demo credentials');
  },

  async listDevices(): Promise<Device[]> {
    await delay();
    store.devices = store.devices.map((device) => (device.last_seen_at ? jitterDevice(device) : device));
    return structuredClone(store.devices);
  },

  async latestDevice(id: number): Promise<DeviceLatest> {
    await delay();
    const device = store.devices.find((item) => item.id === id);
    if (!device) throw new Error('Device not found');
    return {
      device_id: device.id,
      latest_values: device.latest_values,
      last_seen_at: device.last_seen_at,
    };
  },

  async deviceHistory(id: number, minutes = 1440): Promise<HistoryPoint[]> {
    await delay();
    const points = store.history[id] ?? [];
    const from = Date.now() - minutes * 60_000;
    return points.filter((point) => new Date(point.time).getTime() >= from);
  },

  async listAlarms(): Promise<Alarm[]> {
    await delay();
    return structuredClone(store.alarms).sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at));
  },

  async listActiveAlarms(): Promise<Alarm[]> {
    await delay();
    return store.alarms.filter((alarm) => alarm.status === 'ACTIVE');
  },

  async writeRegister(deviceId: number, register: number, value: number): Promise<void> {
    await delay();
    const device = store.devices.find((item) => item.id === deviceId);
    if (!device) throw new Error('Device not found');

    if (register === 100) {
      device.latest_values = { ...device.latest_values, temperature: Number((value / 10).toFixed(1)) };
    }
  },
};
