'use strict';

// This module contains various configuration options
// for this sample application

const connectionParameters = {
  min_conn_interval: 7.5,
  max_conn_interval: 7.5,
  slave_latency: 0,
  conn_sup_timeout: 4000,
};

const scanParameters = {
  active: true,
  interval: 100,
  window: 50,
  timeout: 5,
};

const connectionOptions = {
  scanParams: scanParameters,
  connParams: connectionParameters,
};

const adapaterOpenOptions = {
  baudRate: 115200,
  parity: 'none',
  flowControl: 'none',
  enableBLE: true,
  eventInterval: 0,
};

const peripheralOptions = {
  serviceUUID: '1111',
  charUUID: '2222',
  deviceName: 'TestNRF5X'
};

module.exports = {
  connectionParameters,
  scanParameters,
  connectionOptions,
  adapaterOpenOptions,
  peripheralOptions
};
