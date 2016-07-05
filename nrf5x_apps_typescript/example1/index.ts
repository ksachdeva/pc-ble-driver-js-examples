'use strict';

declare var process: any;

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

import * as config from './config';

const adapterFactory = api.AdapterFactory.getInstance();

adapterFactory.on('added', adapter => {
  console.log(`onAdded: ${adapter.instanceId}`);
});

adapterFactory.on('removed', adapter => {
  console.log(`onRemoved: ${adapter.instanceId}`);
});

adapterFactory.on('error', error => {
  console.log(`onError: ${JSON.stringify(error, null, 1)}`);
});

// this will have the selected adapater
let adapterOne: Adapter = null;
let listenersAdded = false;

function startApp(adapater: Adapter) {
  console.log('Starting the app ...');

  adapterOne = adapater;

  let connect_in_progress = false;

  if (!listenersAdded) {
    adapterOne.on('logMessage', (severity, message) => {
      if (severity > 1)
        console.log(`#1 logMessage: ${message}`);
    });
    adapterOne.on('status', (status) => {
      console.log('#########################################');
      console.log(`#1 status: ${JSON.stringify(status)}`);
      console.log('#########################################');
    });
    adapterOne.on('error', error => {
      console.log('#########################################');
      console.log('#1 error: ' + JSON.stringify(error, null, 1));
      console.log('#########################################');
    });
    adapterOne.on('stateChanged', state => {
      console.log('#########################################');
      console.log('#1 stateChanged: ' + JSON.stringify(state));
      console.log('#########################################');
    });

    adapterOne.on('connParamUpdateRequest', (device: Device, requestedParameters) => {
      console.log('#1 connParamUpdateRequest: ' + JSON.stringify(device));
      console.log(requestedParameters);
    });

    adapterOne.on('deviceDisconnected', (device: Device) => {
      console.log('#1 deviceDisconnected: ' + JSON.stringify(device));
    });

    adapterOne.on('deviceConnected', (device: Device) => {
      console.log('#1 deviceConnected: ' + JSON.stringify(device));

      adapterOne.getServices(device.instanceId, (err, services) => {
        if (err) {
          console.error('failed to discover services');
        } else {
          // since we are connecitng to iPhone the discovery
          // will return many services
          console.log(services);

          // get the desired service and then discover characterisitc on it
          const desiredService = services.filter((s) => s.uuid === config.peripheralOptions.serviceUUID)[0];
          console.log(desiredService);

          adapterOne.getCharacteristics(desiredService.instanceId, (err, chars) => {
            console.log(chars);

            const desiredChar = chars.filter((c) => c.uuid === config.peripheralOptions.charUUID)[0];
            adapterOne.readCharacteristicValue(desiredChar.instanceId, (err, val) => {
              console.log(val);

              console.log('Press c to terminate the program ..');

            });

          });
        }
      });
    });

    adapterOne.on('deviceDiscovered', device => {

      console.log(`Discovered device: ${JSON.stringify(device)}`);

      if (device.name === config.peripheralOptions.deviceName) {
        // we issue stopScan
        adapterOne.stopScan(() => {
          console.log('issuing the connection ...');
          adapterOne.connect(device.address, config.connectionOptions, (err) => {
            if (err) {
              console.log('Failed during connection to the device', err);
              return;
            }
          });
        });
      }
    });

    listenersAdded = true;
  }

  adapterOne.open(config.adapaterOpenOptions, (error) => {
    if (error) {
      console.error('Error during adapater opening ..', error);
      return;
    }

    let advData = {
      completeLocalName: 'adapterOne',
      txPowerLevel: 20,
    };

    console.log('Enabling BLE');
    adapterOne.getState((error, state) => {
      if (error) {
        console.error('Error during adapater getState ..', error);
        return;
      }

      console.log('Adapater State: ', JSON.stringify(state));

      //console.log('Setting name');
      adapterOne.setName('adapterOne', error => {
        if (error) {
          console.error('Error during adapater setName ..', error);
          return;
        }

        console.log('Starting scan ....');
        adapterOne.startScan(config.scanParameters, (error) => {
          if (error) {
            console.error('Error during StartScan ..', error);
            return;
          }
        });
      });
    });
  });
}

// Below code helps to select the adapater and stop it
// At present the first adapater is selected when you will press
// 's' and will close it when you will press 'c'

console.log('Keyboard actions:');
console.log('s: open adapter and start scanning');
console.log('c: close adapter');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', (data) => {
  if (data == 's') {
    console.log('s pressed');
    adapterFactory.getAdapters((error, adapters) => {
      if (error) {
        console.error('Error when getting the adapater ', error);
      } else {
        startApp(adapters[Object.keys(adapters)[0]]);
      }
    });
  } else if (data == 'c') {
    if (adapterOne !== undefined && adapterOne !== null) {
      console.log('Closing adapter');
      adapterOne.close(err => console.log('Adapter closed!'));
    }
  }

});
