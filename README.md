# Examples showing how to use pc-ble-driver-js node module

This repository contains examples of how to use pc-ble-driver-js node module from NordicSemiConductor

Since you will make either a peripheral or central application (or may be both) you would need the corresponding
devices.

One easy way to create peripherals is to use LightBlue iOS application and create a virtual peripheral in it.

The virtual peripheral I create has following properties :
* LocalName : TestNRF5X
* ServiceUUID : 1111
* Service 1111 has a characteristic whose UUID is 2222 and is readable
* I put 2 random values in 2222

## nrf5x_apps

This nodejs application contains various examples that make use of pc-ble-driver-js node module and interact with samples in bleno_apps

## Misc notes

* My development and test machine is Macbook pro running OS X 10.11.xx (El Capitan)

* I am using PCA10040 V1.1.0 2016.9 board

* I use the latest and greatest connectivity firmware that is provided as part of pc-ble-driver-js node module
