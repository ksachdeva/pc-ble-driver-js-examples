# Example 1

This example shows how to
* Scan for devices
* Connect to selected device
* Discover services in the selected device
* Discover characteristics of the selected service
* Read the selected characteristic
* Go back to scanning after successful reading of characteristic
* Resume in case of error

Explaining Reactive Extensions & RxJS library is not in scope of this example but the example would hopefully
 motivate you to check out the concept & the library.

```
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

```

If you compare this code with the one here - [nrf5x_apps](https://github.com/ksachdeva/pc-ble-driver-js-examples/blob/master/nrf5x_apps/example1/index.js) you will
see that this is more readable and easier to follow.
