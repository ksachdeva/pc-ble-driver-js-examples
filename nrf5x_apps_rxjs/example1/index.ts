import {Observable, Subscriber} from 'rxjs';
import {
  api,
  driver,
  Adapter,
  AdapterOpenOptions,
  ScanParameters,
  ConnectionParameters,
  ConnectionOptions,
  Device,
  Service,
  Characteristic
} from 'pc-ble-driver-js';

import * as bleObs from 'rx-pc-ble-driver-js';

import * as config from './config';

const adapterFactory = api.AdapterFactory.getInstance();

const scanOptions: ScanParameters = config.scanParameters;
const connectionParameters: ConnectionParameters = config.connectionParameters;
const connectOptions: ConnectionOptions = config.connectionOptions;
const serviceUUID = config.peripheralOptions.serviceUUID;
const charUUID = config.peripheralOptions.charUUID;

const adapterFactory$ = bleObs.adapaterFactoryObservable(adapterFactory);

const openAdapter$ = adapterFactory$
  .filter((adapterEvent) => adapterEvent.eventType === bleObs.AdapterFactoryEventType.Added)
  .take(1)
  .map(adapterEvent => adapterEvent.adapter)
  .flatMap(adapter => bleObs.openAdapaterObservable(adapter));

function discoverServicesObservable(adapter: Adapter, connectedDevice: Device) {
  return bleObs.discoverServicesObservable(adapter, connectedDevice)
    .map((services: Service[]) => {
      // return empty if no desired service found
      const foundServices = services.filter((s) => s.uuid === serviceUUID);
      if (foundServices.length === 1) {
        return foundServices[0];
      }
      return null;
    });
}

function discoverCharacteristicsObservable(adapter: Adapter, service: Service) {
  return bleObs.discoverCharacteristicObservable(adapter, service)
    .map((chars: Characteristic[]) => {
      // return empty if no desired char found
      const foundChars = chars.filter((c) => c.uuid === charUUID);
      if (foundChars.length === 1) {
        return foundChars[0];
      }
      return null;
    });
}

function readCharacteristicsObservable(adapter: Adapter, char: Characteristic, connectedDevice: Device) {
  let val = null;
  return bleObs.readCharacteristicObservable(adapter, char)
    .do((value) => {
      val = value;
    })
    .flatMap(() => bleObs.disconnectDeviceObservable(adapter, connectedDevice))
    .map(() => {
      return val;
    });
}

function discoverCharsAndReadObservable(adapter: Adapter, service: Service, connectedDevice: Device) {
  return discoverCharacteristicsObservable(adapter, service)
    .flatMap((char: Characteristic) => {
      return Observable.if(() => char !== null,
        readCharacteristicsObservable(adapter, char, connectedDevice),
        bleObs.disconnectDeviceObservable(adapter, connectedDevice)
      );
    });
}

function readFromDeviceObservable(adapter: Adapter, device: Device) {
  let connectedDevice = null;
  return bleObs.connectDeviceObservable(adapter, device, connectOptions)
    .flatMap((device: Device) => {
      connectedDevice = device;
      return discoverServicesObservable(adapter, connectedDevice);
    })
    .flatMap((service: Service) => {
      return Observable.if(() => service !== null,
        discoverCharsAndReadObservable(adapter, service, connectedDevice),
        bleObs.disconnectDeviceObservable(adapter, connectedDevice)
      );
    });
}

function getCharObservable(adapter: Adapter) {
  let selectedDevice = null;

  return Observable.of(adapter)
    .flatMap((adapter) => bleObs.startScanDevicesObservable(adapter, scanOptions))
    .filter((device: Device) => device.name === config.peripheralOptions.deviceName)
    .take(1)
    .flatMap((device: Device) => {
      selectedDevice = device;
      return bleObs.stopScanDevicesObservable(adapter);
    })
    .flatMap(() => readFromDeviceObservable(adapter, selectedDevice));
}

function startReading(adapter: Adapter) {
  const readChar$ = getCharObservable(adapter);
  const subscription = readChar$
    .subscribe(val => {
      console.log(val);
      subscription.unsubscribe();
      startReading(adapter);
    },
    err => {
      console.error(err);
      // simply resume the process
      subscription.unsubscribe();
      console.log('resuming the process ..');
      startReading(adapter);
    },
    () => console.log('completed')
    );
}

function init() {
  openAdapter$.subscribe((adapter: Adapter) => {

    adapter.on('error', (err) => {
      console.log('An error occurred ..');
      console.error(err);
    });

    startReading(adapter);
  });
}

init();
