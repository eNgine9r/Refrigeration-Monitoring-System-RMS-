import type { Alarm, Device, DeviceLatest, DeviceStatus, HistoryPoint, LoginPayload, LoginResponse } from '@/types/api';

type MockStore = {
  devices: Device[];
  alarms: Alarm[];
  history: Record<number, HistoryPoint[]>;
};

const DEVICE_BLUEPRINTS = [
  ['Freezer Room 1', 'Kyiv Store #1'],
  ['Freezer Room 2', 'Kyiv Store #1'],
  ['Display Case A', 'Kyiv Store #1'],
  ['Display Case B', 'Kyiv Store #1'],
  ['Walk-in Cooler North', 'Lviv Store #2'],
  ['Walk-in Cooler South', 'Lviv Store #2'],
  ['Ice Cream Vault', 'Lviv Store #2'],
  ['Dairy Showcase 1', 'Odesa Store #3'],
  ['Dairy Showcase 2', 'Odesa Store #3'],
  ['Meat Cabinet', 'Odesa Store #3'],
  ['Seafood Cabinet', 'Dnipro Store #4'],
  ['Beverage Chiller', 'Dnipro Store #4'],
  ['Frozen Backup A', 'Dnipro Store #4'],
  ['Frozen Backup B', 'Kharkiv Store #5'],
] as const;

const CONTROLLERS: Device['controller_model'][] = ['Carel iJF', 'Dixell XR60', 'Eliwell IDPlus'];
const now = Date.now();

const rand = (min: number, max: number): number => Math.random() * (max - min) + min;
const randInt = (min: number, max: number): number => Math.floor(rand(min, max + 1));
const delay = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, randInt(300, 800)));

function createHistory(baseTemperature: number): HistoryPoint[] {
  return Array.from({ length: 24 * 12 }, (_, i) => {
    const minutesAgo = (24 * 12 - i) * 5;
    const ts = new Date(now - minutesAgo * 60_000).toISOString();
    const wave = Math.sin(i / 10) * 0.9;
    const noise = rand(-0.35, 0.35);
    return { time: ts, field: 'temperature', value: Number((baseTemperature + wave + noise).toFixed(2)) };
  });
}

function deriveStatus(device: Device): DeviceStatus {
  const temp = Number(device.latest_values?.temperature ?? 0);
  if (!device.last_seen_at || Date.now() - new Date(device.last_seen_at).getTime() > 8 * 60_000) return 'offline';
  if ((device.high_temp_threshold && temp > device.high_temp_threshold) || (device.low_temp_threshold && temp < device.low_temp_threshold)) return 'alarm';
  return 'online';
}

function buildStore(): MockStore {
  const devices: Device[] = DEVICE_BLUEPRINTS.map(([name, location], index) => {
    const id = index + 1;
    const freezer = name.toLowerCase().includes('freezer') || name.toLowerCase().includes('frozen') || name.toLowerCase().includes('vault');
    const base = freezer ? -19 + rand(-1.8, 1.8) : 4 + rand(-1.2, 1.2);
    const isAlarm = [3, 8, 11].includes(id);
    const isOffline = [4, 13].includes(id);
    const temperature = isAlarm ? base + rand(5.5, 8.5) : base;

    const device: Device = {
      id,
      name,
      location,
      controller_model: CONTROLLERS[index % CONTROLLERS.length],
      protocol: index % 3 === 0 ? 'tcp' : 'rtu',
      host: index % 3 === 0 ? `192.168.10.${90 + id}` : null,
      port: index % 3 === 0 ? 502 : null,
      serial_port: index % 3 === 0 ? null : '/dev/ttyUSB0',
      baudrate: 9600,
      modbus_address: id,
      polling_interval_sec: randInt(5, 20),
      register_map: {
        temperature: { address: 100, type: 'holding', scale: 0.1 },
        setpoint: { address: 101, type: 'holding', scale: 0.1 },
        alarm: { address: 200, type: 'coil' },
      },
      high_temp_threshold: freezer ? -12 : 8,
      low_temp_threshold: freezer ? -30 : 0,
      latest_values: { temperature: Number(temperature.toFixed(1)), setpoint: freezer ? -18 : 4, alarm: isAlarm },
      status: 'online',
      last_seen_at: isOffline ? new Date(now - randInt(9, 15) * 60_000).toISOString() : new Date(now - randInt(20, 80) * 1000).toISOString(),
    };

    device.status = deriveStatus(device);
    return device;
  });

  const alarms: Alarm[] = [
    {
      id: 1,
      device_id: 3,
      alarm_type: 'HIGH_TEMP',
      status: 'ACTIVE',
      severity: 3,
      message: 'Display Case A temperature above threshold',
      details: 'Measured 12.1°C for 10 minutes',
      started_at: new Date(now - 11 * 60_000).toISOString(),
      updated_at: new Date(now - 3 * 60_000).toISOString(),
      resolved_at: null,
    },
    {
      id: 2,
      device_id: 4,
      alarm_type: 'DEVICE_OFFLINE',
      status: 'ACTIVE',
      severity: 4,
      message: 'Display Case B lost communication',
      details: 'No packets received on Modbus line',
      started_at: new Date(now - 14 * 60_000).toISOString(),
      updated_at: new Date(now - 5 * 60_000).toISOString(),
      resolved_at: null,
    },
    {
      id: 3,
      device_id: 8,
      alarm_type: 'SENSOR_ERROR',
      status: 'RESOLVED',
      severity: 2,
      message: 'Dairy Showcase 1 sensor reconnect',
      details: 'Sensor replaced and validated',
      started_at: new Date(now - 6 * 60 * 60_000).toISOString(),
      updated_at: new Date(now - 5 * 60 * 60_000).toISOString(),
      resolved_at: new Date(now - 5 * 60 * 60_000).toISOString(),
    },
  ];

  const history: Record<number, HistoryPoint[]> = {};
  devices.forEach((device) => {
    history[device.id] = createHistory(Number(device.latest_values?.temperature ?? 0));
  });

  return { devices, alarms, history };
}

const store = buildStore();

function evolveState(): void {
  store.devices = store.devices.map((device) => {
    if (!device.last_seen_at || device.status === 'offline') return device;

    const current = Number(device.latest_values?.temperature ?? 0);
    const next = Number((current + rand(-0.35, 0.35)).toFixed(1));
    const updated: Device = {
      ...device,
      latest_values: { ...device.latest_values, temperature: next },
      last_seen_at: new Date().toISOString(),
    };
    updated.status = deriveStatus(updated);

    const point: HistoryPoint = { time: new Date().toISOString(), field: 'temperature', value: next };
    store.history[device.id] = [...store.history[device.id].slice(-287), point];
    return updated;
  });
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
    evolveState();
    return structuredClone(store.devices);
  },

  async latestDevice(id: number): Promise<DeviceLatest> {
    await delay();
    evolveState();
    const device = store.devices.find((item) => item.id === id);
    if (!device) throw new Error('Device not found');
    return { device_id: device.id, latest_values: device.latest_values, last_seen_at: device.last_seen_at };
  },

  async deviceHistory(id: number, minutes = 1440): Promise<HistoryPoint[]> {
    await delay();
    const from = Date.now() - minutes * 60_000;
    return (store.history[id] ?? []).filter((point) => new Date(point.time).getTime() >= from);
  },

  async listAlarms(): Promise<Alarm[]> {
    await delay();
    const alarms = structuredClone(store.alarms).sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at));
    return alarms;
  },

  async listActiveAlarms(): Promise<Alarm[]> {
    await delay();
    return store.alarms.filter((alarm) => alarm.status === 'ACTIVE');
  },

  async acknowledgeAlarm(alarmId: number): Promise<void> {
    await delay();
    const alarm = store.alarms.find((item) => item.id === alarmId);
    if (alarm && alarm.status === 'ACTIVE') {
      alarm.status = 'ACKNOWLEDGED';
      alarm.updated_at = new Date().toISOString();
    }
  },

  async resolveAlarm(alarmId: number): Promise<void> {
    await delay();
    const alarm = store.alarms.find((item) => item.id === alarmId);
    if (alarm && alarm.status !== 'RESOLVED') {
      alarm.status = 'RESOLVED';
      alarm.resolved_at = new Date().toISOString();
      alarm.updated_at = new Date().toISOString();
    }
  },

  async writeRegister(deviceId: number, register: number, value: number): Promise<void> {
    await delay();
    const device = store.devices.find((item) => item.id === deviceId);
    if (!device) throw new Error('Device not found');

    if (register === 100) {
      device.latest_values = { ...device.latest_values, temperature: Number((value / 10).toFixed(1)) };
    }
    if (register === 101) {
      device.latest_values = { ...device.latest_values, setpoint: Number((value / 10).toFixed(1)) };
    }
    device.status = deriveStatus(device);
  },

  async controllerAction(deviceId: number, action: 'on' | 'off' | 'defrost' | 'reset_alarm'): Promise<void> {
    await delay();
    const device = store.devices.find((item) => item.id === deviceId);
    if (!device) throw new Error('Device not found');

    if (action === 'reset_alarm') {
      store.alarms = store.alarms.map((alarm) => (alarm.device_id === deviceId && alarm.status !== 'RESOLVED' ? { ...alarm, status: 'RESOLVED', resolved_at: new Date().toISOString() } : alarm));
      device.status = 'online';
      device.latest_values = { ...device.latest_values, alarm: false };
    }
  },
};
