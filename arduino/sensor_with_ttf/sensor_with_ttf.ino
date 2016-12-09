// Import dependent libraries

#include <SparkFunDS1307RTC.h>
#include <SparkFunBME280.h>
#include "Wire.h"

#include <Time.h>
#include <TimeLib.h>

#include <avr/io.h>
#include <avr/interrupt.h>

#include <URTouch.h>
#include <URTouchCD.h>

#include <memorysaver.h>
#include <UTFT.h>

// Declare which fonts we will be using
//extern uint8_t SmallFont[]; comment out since we don't use small font for now.
extern uint8_t Dingbats1_XL[];
extern uint8_t Sinclair_M[];
extern uint8_t Sinclair_S[];
extern uint8_t SevenSegNumFontPlusPlus[];


// Initialize display
// ------------------
// Set the pins to the correct ones for your development board
// -----------------------------------------------------------
// Standard Arduino Uno/2009 Shield            : <display model>,19,18,17,16
// Standard Arduino Mega/Due shield            : <display model>,38,39,40,41
// CTE TFT LCD/SD Shield for Arduino Due       : <display model>,25,26,27,28
// Teensy 3.x TFT Test Board                   : <display model>,23,22, 3, 4
// ElecHouse TFT LCD/SD Shield for Arduino Due : <display model>,22,23,31,33
//
// Remember to change the model parameter to suit your display module!
UTFT myGLCD(ITDB43,38,39,40,41);

// Initialize touchscreen
// ----------------------
// Set the pins to the correct ones for your development board
// -----------------------------------------------------------
// Standard Arduino Uno/2009 Shield            : 15,10,14, 9, 8
// Standard Arduino Mega/Due shield            :  6, 5, 4, 3, 2
// CTE TFT LCD/SD Shield for Arduino Due       :  6, 5, 4, 3, 2
// Teensy 3.x TFT Test Board                   : 26,31,27,28,29
// ElecHouse TFT LCD/SD Shield for Arduino Due : 25,26,27,29,30
//
URTouch  myTouch( 6, 5, 4, 3, 2);


#define IRQ_GATE_IN 13  // We use timer interrupt to handle measuring sensors every exact 0.1 second

// Define pin number for sensors
#define NOISE_IN A0
#define BRIGHTNESS_IN A1
#define RCT_CS_PIN 53

#define SELECT_PREV_SENSOR 14
#define SELECT_NEXT_SENSOR 15
#define TOGGLE_RECORD 16
#define NEW_SNAPSHOT 17

#define GRAPH_SIZE 20 // the number of each sensor data stored in memory to render a graph
#define SAMPLE_SIZE 10
#define SENSOR_SIZE 5 // the total number of sensors attached to the device. It needs to be changed manunally if more sensors are added.

#define SCREEN_WIDTH 480
#define SCREEN_HEIGHT 270
#define SENSOR_VALUE_DIGIT 6

typedef struct {
  int sample; // the current sample number (0 ~ 9)
  int noise[GRAPH_SIZE];
  int temperature[GRAPH_SIZE];
  long pressure[GRAPH_SIZE];
  int humidity[GRAPH_SIZE];
  int brightness[GRAPH_SIZE];
} MEASURES;

typedef struct {
  int active; // the index number of the sensor which is currently selected
  String types[SENSOR_SIZE];
  String units[SENSOR_SIZE];
  long mins[SENSOR_SIZE];
  long maxs[SENSOR_SIZE];
  String models[SENSOR_SIZE];
} SENSORS;

// Intialize variables
MEASURES measures;
SENSORS sensors;
long touchX, touchY;  // placeholder for the touch position on the screen
int select_prev_sensor_prev_value;
int select_next_sensor_prev_value;
int toggle_record_prev_value;
int prev_snapshot_prev_value;
bool is_recording;
int total_snapshots;
int total_records;
BME280 bmeSensor;

void setup() {
  // Serial Setting
  Serial.begin(9600);
  
  // Initialize timer 1
  cli();          // disable global interrupts
  TCCR1A = 0;     // set entire TCCR1A register to 0
  TCCR1B = 0;     // same for TCCR1B

  // set compare match register to desired timer count:
  OCR1A = 15624 * 0.1;  // Intterupt timer every 0.1 second.
  // turn on CTC mode:
  TCCR1B |= (1 << WGM12);
  // Set CS10 and CS12 bits for 1024 prescaler:
  TCCR1B |= (1 << CS10);
  TCCR1B |= (1 << CS12);
  // enable timer compare interrupt:
  TIMSK1 |= (1 << OCIE1A);
  // enable global interrupts:
  sei();

  // Initialize ttf screen
  myGLCD.InitLCD();
  myGLCD.clrScr();
  myTouch.InitTouch();
  myTouch.setPrecision(PREC_HI);


  measures = { 
    0, 
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // noise
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // temperature
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // pressure
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // humidity
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // light
  };

  sensors = {
    0,
    {"NOISE",     "BRIGHTNESS", "TEMPERATURE",  "PRESSURE",  "HUMIDITY"},  // types of sensors
    {"dB",        "lux",        "F",           "kPA",      "%"},            // units of sensors
    {0,           0,            0,              80000,      0},                 // min value of sensors
    {150,         1000,         125,            120000,     100 },               // max value of sensors
    {"SEN-12642", "TEMT6000",   "BME280",       "BME280",   "BME280"} // model number of sensors
  };

  is_recording = false;
  total_snapshots = 0;
  total_records = 0;

  // Set pin modes
  pinMode(SELECT_PREV_SENSOR, INPUT);
  pinMode(SELECT_NEXT_SENSOR, INPUT);
  pinMode(TOGGLE_RECORD, INPUT);

  // Initialize IC2 connections
  rtc.begin();
  rtc.enable();
  rtc.set12Hour();
//  rtc.autoTime(); // only reset the time when the time is not correct.
  rtc.update();
  
  

  //For I2C, enable the following and disable the SPI section
  bmeSensor.settings.commInterface = I2C_MODE;
  bmeSensor.settings.I2CAddress = 0x77;
  bmeSensor.settings.runMode = 3; //Forced mode
  bmeSensor.settings.tStandby = 0;
  bmeSensor.settings.filter = 0;
  bmeSensor.settings.tempOverSample = 1;
  bmeSensor.settings.pressOverSample = 1;
  bmeSensor.settings.humidOverSample = 1;
  bmeSensor.begin();

  

  // Render initial screen interface
  renderActiveSensorName();
}

ISR(TIMER1_COMPA_vect) {  // Call back function for timer 1
  digitalWrite(IRQ_GATE_IN, !digitalRead(IRQ_GATE_IN));
  // Read sensor data and render on the screen
  measures.sample += 1;
  measureNoise();
  measureBrightness();  
  if (measures.sample >= SAMPLE_SIZE) {
    unrenderActiveSensorGraph();
    updateNoise();
    updateBrightness();
    updateTemperature();
    updatePressure();
    updateHumidity();
    renderActiveSensorGraph();
    measures.sample = 0;
  }
}

void measureNoise() {
  measures.noise[GRAPH_SIZE-1] = (measures.noise[GRAPH_SIZE-1] * measures.sample + analogRead(NOISE_IN)) / (measures.sample + 1);
}
void updateNoise() {
  for (int i=0; i<GRAPH_SIZE-1; i++) {
    measures.noise[i] = measures.noise[i+1];
  }
  measures.noise[GRAPH_SIZE-1] = 0;
}

void measureBrightness() {
    measures.brightness[GRAPH_SIZE-1] = (measures.brightness[GRAPH_SIZE-1] * measures.sample + analogRead(BRIGHTNESS_IN)) / (measures.sample + 1);
}

void updateBrightness() {
  for (int i=0; i<GRAPH_SIZE-1; i++) {
    measures.brightness[i] = measures.brightness[i+1];
  }
  measures.brightness[GRAPH_SIZE-1] = 0;
}

void measureTemperature() {
  measures.temperature[GRAPH_SIZE-1] = (int) bmeSensor.readTempF();
}
void updateTemperature() {
  for (int i=0; i<GRAPH_SIZE-1; i++) {
    measures.temperature[i] = measures.temperature[i+1];
  }
  measures.temperature[GRAPH_SIZE-1] = 0;
}
void measurePressure() {
  measures.pressure[GRAPH_SIZE-1] = (long) bmeSensor.readFloatPressure();
}
void updatePressure() {
  for (int i=0; i<GRAPH_SIZE-1; i++) {
    measures.pressure[i] = measures.pressure[i+1];
  }
  measures.pressure[GRAPH_SIZE-1] = 0;
}
void measureHumidity() {
  measures.humidity[GRAPH_SIZE-1] = (long) bmeSensor.readFloatHumidity();
}
void updateHumidity() {
  for (int i=0; i<GRAPH_SIZE-1; i++) {
    measures.humidity[i] = measures.humidity[i+1];
  }
  measures.humidity[GRAPH_SIZE-1] = 0;
}

void loop() {
  static int8_t lastSecond = -1;
  // Call rtc.update() to update all rtc.seconds(), rtc.minutes(),
  // etc. return functions.
  rtc.update();
  if (rtc.second() != lastSecond) { // If the second has changed
    renderTime(); // Print the new time
    lastSecond = rtc.second(); // Update lastSecond value
  }
  measureTemperature();
  measurePressure();
  measureHumidity();

  
  renderActiveSensorValue();
  selectActiveSensor();
  detectRecordStatus();
  detectNewSnapshot();
  delay(100);
}

void selectActiveSensor() {
  int select_prev_sensor_cur_value = digitalRead(SELECT_PREV_SENSOR);
  int select_next_sensor_cur_value = digitalRead(SELECT_NEXT_SENSOR);
  if (select_prev_sensor_prev_value == HIGH && select_prev_sensor_cur_value == LOW) {
    sensors.active--;
    if (sensors.active < 0) {
      sensors.active = SENSOR_SIZE - 1;
    }
    myGLCD.clrScr();
    renderActiveSensorName();
  } else if (select_next_sensor_prev_value == HIGH && select_next_sensor_cur_value == LOW) {
    sensors.active++;
    if (sensors.active >= SENSOR_SIZE) {
      sensors.active = 0;
    }
    myGLCD.clrScr();
    renderActiveSensorName();
  }
  select_prev_sensor_prev_value = select_prev_sensor_cur_value;
  select_next_sensor_prev_value = select_next_sensor_cur_value;
}

void detectRecordStatus() {
  int toggle_record_cur_value = digitalRead(TOGGLE_RECORD);
  if (toggle_record_prev_value == LOW && toggle_record_cur_value == HIGH) {
    is_recording = !is_recording;
    if (is_recording) {
      total_records++;
    }
  }
  if (is_recording) {
    myGLCD.setColor(255, 0, 0);
    myGLCD.setFont(Dingbats1_XL);
    myGLCD.print("p", 340, 150);
    myGLCD.setFont(Sinclair_S);
    myGLCD.print("RECORDING... ", RIGHT, 156);  
  } else {
    myGLCD.setColor(255, 255, 255);
    myGLCD.setFont(Dingbats1_XL);
    myGLCD.print("o", 340, 150);
    myGLCD.setFont(Sinclair_S);
    myGLCD.print("READY        ", RIGHT, 156);
  }
  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(Dingbats1_XL);
  myGLCD.print("m", 340, 90);
  myGLCD.setFont(Sinclair_S);
  if ( total_records < 10) {
    myGLCD.print(((String) total_records) +  " RECORDS    ", RIGHT, 96);
  } else if ( total_snapshots < 100) {
    myGLCD.print(((String) total_records) + " RECORDS   ", RIGHT, 96);
  } else if ( total_snapshots < 1000) {
    myGLCD.print(((String) total_records) + " RECORDS  ", RIGHT, 96);
  }
  toggle_record_prev_value = toggle_record_cur_value;
}

void detectNewSnapshot() {
  int new_snapshot_prev_value = digitalRead(NEW_SNAPSHOT);
  if (prev_snapshot_prev_value == LOW && new_snapshot_prev_value == HIGH) {
    total_snapshots++;
  }
  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(Dingbats1_XL);
  myGLCD.print("V", 340, 120);
  myGLCD.setFont(Sinclair_S);
  if ( total_snapshots < 10) {
    myGLCD.print(((String) total_snapshots) +  " SNAPSHOTS  ", RIGHT, 126);
  } else if ( total_snapshots < 100) {
    myGLCD.print(((String) total_snapshots) + " SNAPSHOTS ", RIGHT, 126);
  } else if ( total_snapshots < 1000) {
    myGLCD.print(((String) total_snapshots) + " SNAPSHOTS", RIGHT, 126);
  }
  prev_snapshot_prev_value = new_snapshot_prev_value;
}


void readUTouchPos() {
  myTouch.read();
  touchX = SCREEN_WIDTH - myTouch.getY() * 2;  // some reason, the orientation of the screen is wrong, so we manually correct it.
  touchY = SCREEN_HEIGHT - myTouch.getX();
}

void renderActiveSensorName() {
  myGLCD.setFont(Sinclair_M);
  myGLCD.setColor(255, 255, 255);
  myGLCD.print(sensors.types[sensors.active] + " SENSOR       ", CENTER, 16);
}

void renderActiveSensorValue() {
  long value = 0;
  if (sensors.types[sensors.active] == "NOISE") {
    value = measures.noise[GRAPH_SIZE-2];
  } else if (sensors.types[sensors.active] == "BRIGHTNESS") {
    value = measures.brightness[GRAPH_SIZE-2];
  } else if (sensors.types[sensors.active] == "TEMPERATURE") {
    value = measures.temperature[GRAPH_SIZE-2];
  } else if (sensors.types[sensors.active] == "PRESSURE") {
    value = measures.pressure[GRAPH_SIZE-2];
  } else if (sensors.types[sensors.active] == "HUMIDITY") {
    value = measures.humidity[GRAPH_SIZE-2];
  }
  String cur_rendered_sensor_value = (String) value;
  myGLCD.setColor(0, 0, 0);
  myGLCD.setBackColor(0, 0, 0);
  myGLCD.fillRect(16, 60, 16 + (SENSOR_VALUE_DIGIT - cur_rendered_sensor_value.length()) * 32 , 60 + 50);
  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(SevenSegNumFontPlusPlus);
  myGLCD.print(cur_rendered_sensor_value, 16 + (SENSOR_VALUE_DIGIT - cur_rendered_sensor_value.length()) * 32, 60);
  myGLCD.setFont(Sinclair_M);
  myGLCD.print(sensors.units[sensors.active], 32 + SENSOR_VALUE_DIGIT * 32, 60 + 30);
}

void unrenderActiveSensorGraph() {
  myGLCD.setColor(0, 0, 0);
  renderGraphHelper();
}

void renderActiveSensorGraph() {
  myGLCD.setColor(0, 255, 0);
  renderGraphHelper();
}

void renderGraphHelper() {
  long minvalue = sensors.mins[sensors.active];
  long maxvalue = sensors.maxs[sensors.active];
  for (int i=0; i<GRAPH_SIZE-2; i++) {
    int graphY1 = 0;
    int graphY2 = 0;
    if (sensors.types[sensors.active] == "NOISE") {
      graphY1 = map(min(max(measures.noise[i], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
      graphY2 = map(min(max(measures.noise[i+1], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
    } else if (sensors.types[sensors.active] == "BRIGHTNESS") {
      graphY1 = map(min(max(measures.brightness[i], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
      graphY2 = map(min(max(measures.brightness[i+1], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
    } else if (sensors.types[sensors.active] == "TEMPERATURE") {
      graphY1 = map(min(max(measures.temperature[i], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
      graphY2 = map(min(max(measures.temperature[i+1], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
    } else if (sensors.types[sensors.active] == "PRESSURE") {
      graphY1 = map(min(max(measures.pressure[i], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
      graphY2 = map(min(max(measures.pressure[i+1], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
    } else if (sensors.types[sensors.active] == "HUMIDITY") {
      graphY1 = map(min(max(measures.humidity[i], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
      graphY2 = map(min(max(measures.humidity[i+1], minvalue), maxvalue), minvalue, maxvalue, 240, 130);
    }
    myGLCD.drawLine(60 + 15 * i, graphY1, 60 + 15 * (i + 1), graphY2);
  }
  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(Sinclair_S);
  myGLCD.print("0s", 325, 250);
  myGLCD.print("10s", 185, 250);
  myGLCD.print("20s", 55, 250);
  myGLCD.print(minvalue + sensors.units[sensors.active], 16, 235);
  myGLCD.print(maxvalue + sensors.units[sensors.active], 16, 125);
  myGLCD.print((int ((maxvalue + minvalue) * 0.5)) + sensors.units[sensors.active], 16, 180);
  myGLCD.print((int (maxvalue * 0.75 + minvalue * 0.25)) + sensors.units[sensors.active], 16, 152);
  myGLCD.print((int (maxvalue * 0.25 + minvalue * 0.75)) + sensors.units[sensors.active], 16, 207);
}

void renderTime() {
  String timevalue = String(rtc.hour()) + ":";
  if (rtc.minute() < 10) {
    timevalue += "0";
  }
  timevalue += String(rtc.minute()) + ":";
  if (rtc.second() < 10) {
    timevalue += "0";
  }
  timevalue += String(rtc.second());
  if (rtc.is12Hour()) { // If we're in 12-hour mode
    if (rtc.pm()) {
      timevalue += " PM  ";
    }
    else {
      timevalue += " AM  ";
    }
  } else {
    timevalue += "  ";
  }
  String datevalue = rtc.dayStr();
  datevalue += "  ";
  String dayvalue = String(rtc.month()) + "/";
  dayvalue += String(rtc.date()) + "/";
  dayvalue += String(rtc.year()) + "  ";

  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(Dingbats1_XL);
  myGLCD.print("W", 340, 55);
  myGLCD.setFont(Sinclair_S);
  myGLCD.print(timevalue, RIGHT, 50);
  myGLCD.print(datevalue, RIGHT, 60);
  myGLCD.print(dayvalue, RIGHT, 70);
}
