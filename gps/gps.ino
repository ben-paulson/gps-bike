/*
 * Prints out latitude and longitude from an
 * external GPS module (NEO-6M). Meant for use on
 * Arduino Mega. Will be modified for Uno.
 */

#include <TinyGPS++.h>

TinyGPSPlus gps;

void setup()
{
  Serial.begin(9600);  //set monitor to 9600
  Serial3.begin(9600);
  Serial.println("Ready!");
}

void loop()
{
  while(Serial3.available() > 0)
  {
    if (gps.encode(Serial3.read())) {
      Serial.print(F("Location: ")); 
      if (gps.location.isValid())
      {
        Serial.print(gps.location.lat(), 6);
        Serial.print(F(","));
        Serial.println(gps.location.lng(), 6);
      }
      else
      {
        Serial.println(F("INVALID"));
      }
    }
  }
}
