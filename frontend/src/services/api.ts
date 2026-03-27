import axios from 'axios';
import { mockApi } from '@/services/mockApi';
import type { Alarm, Device, DeviceLatest, HistoryPoint, LoginPayload, LoginResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';
export const API_MODE = (import.meta.env.VITE_API_MODE ?? 'mock') as 'mock' | 'live';

const liveApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

liveApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('rms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (API_MODE === 'mock') return mockApi.login(payload);
    const { data } = await liveApi.post<LoginResponse>('/auth/login', payload);
    return data;
  },
};

export const devicesApi = {
  async list(): Promise<Device[]> {
    if (API_MODE === 'mock') return mockApi.listDevices();
    const { data } = await liveApi.get<Device[]>('/devices');
    return data;
  },
  async latest(id: number): Promise<DeviceLatest> {
    if (API_MODE === 'mock') return mockApi.latestDevice(id);
    const { data } = await liveApi.get<DeviceLatest>(`/devices/${id}/latest`);
    return data;
  },
  async history(id: number, minutes = 1440): Promise<HistoryPoint[]> {
    if (API_MODE === 'mock') return mockApi.deviceHistory(id, minutes);
    const { data } = await liveApi.get<HistoryPoint[]>(`/devices/${id}/history`, { params: { minutes } });
    return data;
  },
  async writeRegister(id: number, register: number, value: number): Promise<void> {
    if (API_MODE === 'mock') return mockApi.writeRegister(id, register, value);
    await liveApi.post(`/devices/${id}/write`, { register, value });
  },
};

export const alarmsApi = {
  async list(): Promise<Alarm[]> {
    if (API_MODE === 'mock') return mockApi.listAlarms();
    const { data } = await liveApi.get<Alarm[]>('/alarms');
    return data;
  },
  async active(): Promise<Alarm[]> {
    if (API_MODE === 'mock') return mockApi.listActiveAlarms();
    const { data } = await liveApi.get<Alarm[]>('/alarms/active');
    return data;
  },
};
