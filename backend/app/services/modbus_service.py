import asyncio
import logging
from collections.abc import Awaitable, Callable
from typing import Any

from pymodbus.client import AsyncModbusSerialClient, AsyncModbusTcpClient
from pymodbus.exceptions import ModbusException

logger = logging.getLogger(__name__)


class ModbusService:
    def __init__(self, timeout: float = 2.0, retries: int = 2) -> None:
        self.timeout = timeout
        self.retries = retries
        self._clients: dict[str, AsyncModbusSerialClient | AsyncModbusTcpClient] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    def _connection_key(self, device: Any) -> str:
        if device.protocol == 'tcp':
            return f"tcp:{device.host}:{device.port}"
        return f"rtu:{device.serial_port}:{device.baudrate}"

    async def _get_client(self, device: Any) -> AsyncModbusSerialClient | AsyncModbusTcpClient:
        key = self._connection_key(device)
        if key in self._clients:
            return self._clients[key]

        if device.protocol == 'tcp':
            client = AsyncModbusTcpClient(host=device.host, port=device.port, timeout=self.timeout)
        else:
            client = AsyncModbusSerialClient(
                port=device.serial_port,
                baudrate=device.baudrate,
                timeout=self.timeout,
                stopbits=1,
                bytesize=8,
                parity='N',
            )
        await client.connect()
        self._clients[key] = client
        self._locks[key] = asyncio.Lock()
        return client

    async def _execute_with_retry(self, op: Callable[[], Awaitable[Any]]) -> Any:
        last_exc: Exception | None = None
        for attempt in range(self.retries + 1):
            try:
                return await asyncio.wait_for(op(), timeout=self.timeout)
            except (TimeoutError, ModbusException) as exc:
                last_exc = exc
                logger.warning('Modbus operation failed on attempt %s/%s: %s', attempt + 1, self.retries + 1, exc)
                await asyncio.sleep(0.2 * (attempt + 1))
        raise RuntimeError(f'Modbus operation failed after retries: {last_exc}')

    async def read_holding_registers(self, device: Any, address: int, count: int = 1) -> list[int]:
        client = await self._get_client(device)
        lock = self._locks[self._connection_key(device)]

        async with lock:
            async def _op() -> Any:
                return await client.read_holding_registers(address=address, count=count, slave=device.modbus_address)

            response = await self._execute_with_retry(_op)
        if response.isError():
            raise RuntimeError(f'Read holding registers failed: {response}')
        return list(response.registers)

    async def read_coils(self, device: Any, address: int, count: int = 1) -> list[bool]:
        client = await self._get_client(device)
        lock = self._locks[self._connection_key(device)]

        async with lock:
            async def _op() -> Any:
                return await client.read_coils(address=address, count=count, slave=device.modbus_address)

            response = await self._execute_with_retry(_op)
        if response.isError():
            raise RuntimeError(f'Read coils failed: {response}')
        return list(response.bits[:count])

    async def write_register(self, device: Any, address: int, value: int) -> None:
        client = await self._get_client(device)
        lock = self._locks[self._connection_key(device)]

        async with lock:
            async def _op() -> Any:
                return await client.write_register(address=address, value=value, slave=device.modbus_address)

            response = await self._execute_with_retry(_op)
        if response.isError():
            raise RuntimeError(f'Write register failed: {response}')

    async def close_all(self) -> None:
        for client in self._clients.values():
            client.close()
        self._clients.clear()
        self._locks.clear()
