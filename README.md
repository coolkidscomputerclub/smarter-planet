# Smarter Planet Project

## Introduction

In the example in the lab, we used the RSMB (Really Small Message Broker) as an MQTT server, in this instance we're using the [mqttjs node library](https://github.com/adamvr/MQTT.js/) to provide that functionality. This server (rather silently) handles all of the message delivery (i.e. publishing and subscribing).

To get an example running locally, follow these steps:-

### node.js
- navigate to the repository directory
- run `node node/broker.js`

### Arduino
- open network in system preferences and make a note of your IP from the Wi-Fi section
- edit credentials.h in `arduino/main` to reflect your Wi-Fi networks ssid and passphrase
- edit the main.pde Arduino sketch so that the ip which the PubSubClient will be connecting to is yours (see above)
- upload the Arduino sketch to the board and open serial monitor in order to debug
- LED will illuminate if everything has worked as it should

## Lolcommits

Keeps you committing at 2:45AM, [get 'er done](https://github.com/mroth/lolcommits) — I'm doing it post-commit and saving images to `repo/.lolcommits` so that we can all see each others lolcommits. Join in the fun:

![testing](https://github.com/saulhardman/smarter-planet/blob/master/.lolcommits/smarter-planet/562389682a6.jpg?raw=true)

## Ideas

### Physical check-in device
- RFID on back of phone; check-in when you get home, it uses [twilio](http://twilio.com) [node library](https://github.com/sjwalter/node-twilio) to text your housemates and let them know.