from enum import Enum


class UserRole(str, Enum):
    admin = 'admin'
    technician = 'technician'
    viewer = 'viewer'


class AlarmType(str, Enum):
    high_temp = 'HIGH_TEMP'
    low_temp = 'LOW_TEMP'
    device_offline = 'DEVICE_OFFLINE'
    sensor_error = 'SENSOR_ERROR'


class AlarmStatus(str, Enum):
    active = 'ACTIVE'
    acknowledged = 'ACKNOWLEDGED'
    resolved = 'RESOLVED'
