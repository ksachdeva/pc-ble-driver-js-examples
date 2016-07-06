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
```

If you compare this code with the one here - [nrf5x_apps](https://github.com/ksachdeva/pc-ble-driver-js-examples/blob/master/nrf5x_apps/example1/index.js) you will
see that this is more readable and easier to follow.

Since this example runs in endless loop, I noticed that discovery of service was failing when I would stop the
peripheral and no callback was being fired from pc-ble-driver-js library. This is where the **timeout** operator
from RxJS comes to rescue

```
return bleObs.discoverServicesObservable(adapter, selectedDevice)
  .timeout(3000, 'Timeout occurred during service discovery ..');
```

Above snippet essentially is equivalent to saying that generate error if discoverServicesObservable does not emit for 3 seconds.
