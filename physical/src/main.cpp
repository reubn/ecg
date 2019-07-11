#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiManager.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <FS.h>

WiFiManager wifiManager;

ESP8266WebServer server(80);
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
    				webSocket.sendTXT(num, "Hello");
          }
    }
}

String getContentType(String path) {
  if(path.endsWith(".html") || path.endsWith(".htm")) return "text/html";
  else if(path.endsWith(".js")) return "application/javascript";
  else if(path.endsWith(".woff2")) return "font/woff2";
  else if(path.endsWith(".css")) return "text/css";
  return "text/plain";
}

bool readFile(String path){
  if(path.length() == 0 || path.endsWith("/")) path += "index.html";

  String contentType = getContentType(path);
  String gzPath = path + ".gz";

  if(SPIFFS.exists(gzPath)){
    File file = SPIFFS.open(gzPath, "r");
    size_t sent = server.streamFile(file, contentType);
    file.close();

    return true;
  } else if(SPIFFS.exists(path)){
    File file = SPIFFS.open(path, "r");
    size_t sent = server.streamFile(file, contentType);
    file.close();

    return true;
  }

  return false;
}

void setup() {
    pinMode(D7, INPUT);
    pinMode(D6, INPUT);

    Serial.begin(9600);

    wifiManager.setConfigPortalBlocking(false);
    wifiManager.autoConnect();

    if(MDNS.begin("ecg")) Serial.println("mDNS Running: " "ecg");

    SPIFFS.begin();

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    server.onNotFound([]() {
      if(!readFile(server.uri())) server.send(404, "text/plain", "404: Not Found");
    });
    server.begin();
}

void loop() {
    if(((millis() - lastReadingTime) >= 2777) && webSocket.connectedClients() > 0){

      bool rightArmConnected = (digitalRead(D6) == 0);
      bool leftArmConnected = (digitalRead(D7) == 0);

       if(rightArmConnected && leftArmConnected) {
        int valueInt = analogRead(A0);
        lastReadingTime = micros();

        String valueString = String(lastReadingTime) + String(",") + valueInt;
        char* value = (char*) valueString.c_str();
        webSocket.broadcastTXT(value, strlen(value));
      } else {
        String electrodesString = "l";
        if(rightArmConnected) electrodesString += "+";
        if(leftArmConnected) electrodesString += "-";

        char* electrodes = (char*) electrodesString.c_str();
        webSocket.broadcastTXT(electrodes, strlen(electrodes));
      }
    }

    wifiManager.process();
    MDNS.update();
    webSocket.loop();
    server.handleClient();
}
