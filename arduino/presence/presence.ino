#include <SPI.h>
#include <WiFly.h>
#include "credentials.h"
#include <PubSubClient.h>
#include <SoftwareSerial.h>

// RFID Reader
#define rxPin 8
#define txPin 9
#define readerPin 7
#define startByte 0x0A
#define endByte 0x0D
#define tagLength 12
#define delayInterval 1000
SoftwareSerial RFID = SoftwareSerial(rxPin, txPin);
int readerState = HIGH;
bool reading = true;
unsigned long previousMillis;
String currentTag;

// WiFly and MQTT
byte ip[] = {192, 168, 0, 2};
WiFlyClient wiFlyClient;
PubSubClient client(ip, 8080, callback, wiFlyClient);
char* testTopic = "test";

void setup () {

    Serial.begin(115200);

    setupWiFly();

    setupPubSub();

    RFID.begin(2400);

    pinMode(readerPin, OUTPUT);

}

void loop () {

    client.loop();

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

    char tag[10] = "";

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

            tag[bytesRead] = incomingByte;

        }

    }

}

void processTag (char tag[]) {

    currentTag = String(tag);

    Serial.print("Tag has been read: ");

    Serial.println(currentTag);

    client.publish(testTopic, tag);

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

    if (String(topic) == testTopic) {

        String payloadString;

        for (int i = 0; i < length; i++) {

            payloadString.concat(payload[i]);

        }

        Serial.println("Payload received: {topic: " + String(topic) + ", payload: " + payloadString + "}");

    }

}