'use strict';

import {
  ScanParameters,
  ConnectionParameters,
  ConnectionOptions,
  AdapterOpenOptions
} from 'pc-ble-driver-js';

export const connectionParameters: ConnectionParameters = {
  min_conn_interval: 7.5,
  max_conn_interval: 7.5,
  slave_latency: 0,
  conn_sup_timeout: 4000,
};

export const scanParameters: ScanParameters = {
  active: true,
  interval: 100,
  window: 50,
  timeout: 5,
};

export const connectionOptions: ConnectionOptions = {
  scanParams: scanParameters,
  connParams: connectionParameters,
};

export const adapterOpenOptions: AdapterOpenOptions = {
  baudRate: 115200,
  parity: 'none',
  flowControl: 'none',
  enableBLE: true,
  eventInterval: 0,
};

export const peripheralOptions = {
  serviceUUID: '1111',
  charUUID: '2222',
  deviceName: 'TestNRF5X'
};
