# Example 1

This example shows how to
* Scan for devices
* Connect to selected device
* Discover services in the selected device
* Discover characteristics of the selected service
* Read the selected characteristic

config.js file various configuration options. If you have a different name and uuids for
your peripheral devices you can adjust them in this configuration file

index.js is where the main code is.

At present this sample heavily relies on events emitted by adapter object and hence the
code looks really ugly because of callback hell. 
