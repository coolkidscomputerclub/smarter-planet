#include <SPI.h>
#include <WiFly.h>
#include "credentials.h"
#include <PubSubClient.h>
#include <SoftwareSerial.h>

#define soundPin A0
#define ledPin 2
#define soundThreshold 650
#define DELAY 500

//RFID 

#define rxPin 8
#define txPin 9
#define readerPin 7

#define startByte 0x0A
#define endByte 0x0D

#define tagLength 12

#define delayInterval 1000

WiFlyClient wiFlyclient;

int val;
int ledStatus = LOW;

byte ip[] = {192, 168, 0, 2};
PubSubClient client(ip, 8080, callback, wiFlyclient);
char* testTopic = "test";

//RFID

SoftwareSerial RFID = SoftwareSerial(rxPin, txPin);

int readerState = HIGH;

bool reading = true;

unsigned long previousMillis;

String currentTag;

// void callback (char *topic, uint8_t *data, int dataLen) {

//     if (String(topic) == testTopic) {

//         String payload;

//         for (int i = 0; i < dataLen; i++) {

//             payload.concat(data[i]);

//         }

//         Serial.println("Payload received: {topic: " + String(topic) + ", payload: " + payload + "}");

//         switchLED(payload, false);

//     }

// }

void setup () {

    Serial.begin(115200);

    pinMode(ledPin, OUTPUT);

    digitalWrite(ledPin, ledStatus);

    setupWiFly();

    setupPubSub();

    //RFIDReader

    RFID.begin(2400);

    pinMode(readerPin, OUTPUT);

}

void loop () {

    client.loop();

    // RFIDReader

    if (reading == true) {

        startReading();

        if (RFID.available() == 12) {

            stopReading();

            readTag();

        }

    } else {

        checkDelay();

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

        client.subscribe(testTopic);

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

        client.publish(testTopic, message);

    }

}

// RFIDReader

void startReading () {

    turnReaderOn();

}

void stopReading () {

    reading = false;

    Serial.println("reading false");

    turnReaderOff();

    startDelay();

}

void startDelay () {

    previousMillis = millis();

}

void checkDelay () {

    if (millis() - previousMillis > delayInterval) {

        reading = true;

        Serial.println("reading is true");

    }

}

void readTag () {

    Serial.println("reading tag");

    String tag = "";

    for (int bytesRead = 0; bytesRead < tagLength; bytesRead++) {

        Serial.println("running loop");

        int incomingByte = RFID.read();

        Serial.println(incomingByte);

        if (incomingByte == startByte) {

            Serial.print("startByte detected: ");

            Serial.println(incomingByte, DEC);

        } else if (incomingByte == endByte) {

            Serial.print("endByte detected: ");

            Serial.println(incomingByte, DEC);

            processTag(tag);

        } else {

            tag += incomingByte;

        }

    }

}

void processTag (String tag) {

    currentTag = tag;

    Serial.print("Tag has been read: ");

    Serial.println(currentTag);

    RFID.flush();

}

void turnReaderOff () {

    if (readerState == LOW) {

        digitalWrite(readerPin, HIGH);

        readerState = HIGH;

        Serial.print("Turned reader off: ");

        Serial.println(readerState);

    }

}

void turnReaderOn () {

    if (readerState == HIGH) {

        digitalWrite(readerPin, LOW);

        readerState = LOW;

        Serial.print("Turned reader on: ");

        Serial.println(readerState);

    }

}

void callback(char* topic, byte* payload, unsigned int length) {
  // In order to republish this payload, a copy must be made
  // as the orignal payload buffer will be overwritten whilst
  // constructing the PUBLISH packet.
  
  // Allocate the correct amount of memory for the payload copy
  // byte* p = (byte*)malloc(length);
  // Copy the payload to the new buffer
  // memcpy(p,payload,length);
  // client.publish("outTopic", p, length);
  // Free the memory
  // free(p);
}
