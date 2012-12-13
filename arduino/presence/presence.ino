#include <SPI.h>
#include <WiFly.h>
#include "credentials.h"
#include <PubSubClient.h>
#include <SoftwareSerial.h>

// RFID Reader
#define rxPin 3
#define txPin 4
#define readerPin 2
#define startByte 0x0A
#define endByte 0x0D
#define tagLength 12
#define delayInterval 2000
SoftwareSerial RFID = SoftwareSerial(rxPin, txPin);
int readerState = HIGH;
bool reading = true;
unsigned long previousMillis;

// WiFly and MQTT
byte ip[] = {192, 168, 0, 2};
WiFlyClient wiFlyClient;
PubSubClient client(ip, 1883, callback, wiFlyClient);
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

        // detect noise here?
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

        client.publish(testTopic, "hello this is the arduino");

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

    turnReaderOff();

    startDelay();

}

void startDelay () {

    previousMillis = millis();

}

void checkDelay () {

    if (millis() - previousMillis > delayInterval) {

        reading = true;

    }

}

void readTag () {

    char tag[11] = "";

    for (int bytesRead = 0; bytesRead < tagLength; bytesRead++) {

        char incomingByte = RFID.read();

        if (bytesRead == 0 && incomingByte != startByte) {

            // shit's fucked up

            Serial.println("Got some noise...");

            RFID.flush();

            break;

        } else if (incomingByte == endByte) {

            processTag(tag);

        } else {

            tag[bytesRead-1] = incomingByte;

        }

    }

}

void processTag (char tag[]) {

    tag[10] = '\0';

    Serial.println("Payload sent: {topic: " + String(testTopic) + ", payload: " + tag + "}");

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

void callback (char* topic, byte* payload, unsigned int length) {

    if (String(topic) == testTopic) {

        char payloadChar[length+1];

        for (int i = 0; i < length; i++) {

            payloadChar[i] = payload[i];

        }

        payloadChar[length] = '\0';

        Serial.println("Payload received: {topic: " + String(topic) + ", payload: " + payloadChar + "}");

    }

}