#include <SoftwareSerial.h>

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

void setup () {

	Serial.begin(2400);

	RFID.begin(2400);

	pinMode(readerPin, OUTPUT);

}

void loop () {

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