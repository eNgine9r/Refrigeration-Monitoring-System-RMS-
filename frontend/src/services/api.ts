import axios from 'axios';
import type { Alarm, Device, DeviceLatest, HistoryPoint, LoginPayload, LoginResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },
};

export const devicesApi = {
  async list(): Promise<Device[]> {
    const { data } = await api.get<Device[]>('/devices');
    return data;
  },
  async latest(id: number): Promise<DeviceLatest> {
    const { data } = await api.get<DeviceLatest>(`/devices/${id}/latest`);
    return data;
  },
  async history(id: number, minutes = 1440): Promise<HistoryPoint[]> {
    const { data } = await api.get<HistoryPoint[]>(`/devices/${id}/history`, { params: { minutes } });
    return data;
  },
  async writeRegister(id: number, register: number, value: number): Promise<void> {
    await api.post(`/devices/${id}/write`, { register, value });
  },
};

export const alarmsApi = {
  async list(): Promise<Alarm[]> {
    const { data } = await api.get<Alarm[]>('/alarms');
    return data;
  },
  async active(): Promise<Alarm[]> {
    const { data } = await api.get<Alarm[]>('/alarms/active');
    return data;
  },
};
