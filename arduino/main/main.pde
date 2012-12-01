#include <WiFly.h>
#include "credentials.h"
#include <PubSubClient.h>

#define soundPin A0
#define ledPin 2
#define soundThreshold 650
#define DELAY 500

int val;
int ledStatus = LOW;

void callback (char *a, uint8_t *b, int c);

uint8_t ip[] = {192, 168, 0, 2};
PubSubClient client(ip, 8080, callback);
char* ledTopic = "led/status";

void callback (char *topic, uint8_t *data, int dataLen) {

    if (String(topic) == ledTopic) {

        String payload;

        for (int i = 0; i < dataLen; i++) {

            payload.concat(data[i]);

        }

        Serial.println("Payload received: {topic: " + String(topic) + ", payload: " + payload + "}");

        switchLED(payload, false);

    }

}

void setup () {

    Serial.begin(115200);

    pinMode(ledPin, OUTPUT);

    digitalWrite(ledPin, ledStatus);

    setupWiFly();

    setupPubSub();

}

void loop () {

    client.loop();

    val = analogRead(soundPin);

    if (val > soundThreshold) {

        String state;

        if (ledStatus == HIGH) {

            state = "on";

        } else {

            state = "off";

        }

        switchLED(state, true);

        delay(DELAY);

    }

}

void setupWiFly () {

    WiFly.begin();

    Serial.println("WiFly connecting: {ssid: " + String(ssid) + ", passphrase: " + String(passphrase) + "}");

    if (WiFly.join(ssid, passphrase)) {

        Serial.println("WiFly connected.");

    } else {

        Serial.println("Connection to WiFi failed.");

    }

}

void setupPubSub () {

    Serial.println("PubSub connecting...");

    if (client.connect("arduinoClient")) {

        Serial.println("PubSub connected.");

        client.subscribe(ledTopic);

    } else {

        Serial.println("PubSub connection failed.");

    }

}

void switchLED (String state, bool broadcast) {

    if (state == "on" && ledStatus == LOW) {

        ledStatus = HIGH;

        digitalWrite(ledPin, ledStatus);

    } else if (state == "off" && ledStatus == HIGH) {

        ledStatus = LOW;

        digitalWrite(ledPin, ledStatus);

    }

    if (broadcast) {

        char message[state.length()];

        state.toCharArray(message, state.length());

        Serial.println("Status sent: " + state);

        client.publish(ledTopic, message);

    }

}