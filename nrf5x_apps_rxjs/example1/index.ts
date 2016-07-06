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

function getCharObservable(adapter: Adapter) {
  let selectedDevice = null;
  return Observable.of(adapter)
    .do(() => console.log('starting ..'))
    .flatMap((adapter) => bleObs.startScanDevicesObservable(adapter, scanOptions))
    .filter((device: Device) => device.name === config.peripheralOptions.deviceName)
    .take(1)
    .flatMap((device: Device) => {
      selectedDevice = device;
      return bleObs.stopScanDevicesObservable(adapter);
    })
    .flatMap(() => bleObs.connectDeviceObservable(adapter, selectedDevice, connectOptions))
    .flatMap((device: Device) => {
      selectedDevice = device;
      return bleObs.discoverServicesObservable(adapter, selectedDevice)
        .timeout(3000, 'Timeout occurred during service discovery ..');
    })
    .filter((service: Service) => service.uuid === serviceUUID)
    .flatMap((service: Service) => bleObs.discoverCharacteristicObservable(adapter, service))
    .filter((chars: Characteristic) => chars.uuid === charUUID)
    .flatMap((chars: Characteristic) => bleObs.readCharacteristicObservable(adapter, chars))
    .do((val) => console.log('Value:', val))
    .flatMap(() => bleObs.disconnectDeviceObservable(adapter, selectedDevice));
}

function startReading(adapter: Adapter) {
  const readChar$ = getCharObservable(adapter);
  const subscription = readChar$
    .subscribe(val => {
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
