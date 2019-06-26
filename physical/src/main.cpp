#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiManager.h>
#include <WebSocketsServer.h>

WiFiManager wifiManager;

WebSocketsServer webSocket = WebSocketsServer(81);

unsigned long lastReadingTime = micros();

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
        				// send message to client
        				webSocket.sendTXT(num, "Hello");
            }
    }

}

void setup() {
    pinMode(D7, INPUT);
    pinMode(D6, INPUT);

    // Serial.begin(921600);
    Serial.begin(9600);

    wifiManager.setConfigPortalBlocking(false);
    wifiManager.autoConnect();

    if(MDNS.begin("ecg")) Serial.println("mDNS Running: " "ecg");

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    if(((millis() - lastReadingTime) >= 2777) && webSocket.connectedClients() > 0){

      bool positiveConnected = (digitalRead(D6) == 0);
      bool negativeConnected = (digitalRead(D7) == 0);

       if(positiveConnected && negativeConnected) {
        int valueInt = analogRead(A0);
        lastReadingTime = micros();

        String valueString = String(lastReadingTime) + String(",") + valueInt;
        char* value = (char*) valueString.c_str();
        // Serial.println(value);
        webSocket.broadcastTXT(value, strlen(value));
      } else {
        String electrodesString = "l";
        if(positiveConnected) electrodesString += "+";
        if(negativeConnected) electrodesString += "-";

        char* electrodes = (char*) electrodesString.c_str();
        webSocket.broadcastTXT(electrodes, strlen(electrodes));
      }
    }

    wifiManager.process();
    MDNS.update();
    webSocket.loop();
}
