//WIFI+WIFIMANAGER
#include <ESP8266WiFi.h> 
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <WiFiManager.h> //------------> 192.168.4.1
//MQTT
#include <PubSubClient.h>
//SENSOR_TEMP_E_UMIDADE_DO_AR
#include <Adafruit_Sensor.h>
#include <DHT.h>
 
WiFiManager wifiManager;

//security_and_send_files----------------------------------------------------------------------------------------------
String serial_code_estufa = "esp001";
String tipo = "0";
float temperatura_json = 0.0;
float umidade_ar = 0.0;
float umidade_solo = 0.0;

//sensor_de temperatura_e_umidade--------------------------------------------------------------------------------------
#define DHTPIN 2     // pino onde esta conectado o sensor
#define DHTTYPE    DHT11     // tipo de sensor
DHT dht(DHTPIN, DHTTYPE);
float t = 0.0;
float h = 0.0;
unsigned long previousMillis = 0;
const long interval = 10000;

void iniciar_sensor_th() {
  dht.begin();
}

void ler_sensor_th() {
    unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    float newT = dht.readTemperature();
    if (isnan(newT)) {
      Serial.println("Failed to read from DHT sensor!");
    }
    else {
      t = newT;
      temperatura_json = t;
    }
    // Read Humidity
    float newH = dht.readHumidity();
    if (isnan(newH)) {
      Serial.println("Failed to read from DHT sensor!");
    }
    else {
      h = newH;
      umidade_ar = h;
    }
  }
}

//mqtt_system----------------------------------------------------------------------------------------------------------
const char* BROKER_MQTT = "broker.mqtt-dashboard.com"; //URL do broker MQTT que se deseja utilizar //"broker.hivemq.com" -> alternativo "broker.mqtt-dashboard.com"

WiFiClient espClient;                                                   
PubSubClient client(espClient);                                         
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (120) //--> 50
char msg[MSG_BUFFER_SIZE];
int value = 0;

void callback(char* topic, byte* payload, unsigned int length) {      
  Serial.print("Mensagem recebida [");                                  
  Serial.print(topic);                                                  
  Serial.print("] ");                                                   
  for (int i = 0; i < length; i++) {                                    
    Serial.print((char)payload[i]);                                     
  }
  Serial.println();                                                     

}

void reconnect() {                                                       
  while (!client.connected()) {                                          
    Serial.print("Aguardando conexão MQTT...");                          
    if (client.connect("ESP8266Client")) {                               
      Serial.println("conectado");                                       
      //client.publish("pub_do_esp8266_ifal_ca", "hello world");    
      //client.subscribe("sub_do_esp8266");                         
    } else {                                                             
      Serial.print("falhou, rc=");                                       
      Serial.print(client.state());                                      
      Serial.println(" tente novamente em 5s");                          
      delay(5000);                                                       
    }
  }
}

//setup_functions(mqtt+wifimanager)______________________________________________________________________________________
void wifi_manager_config() {
  Serial.println();
  //wifiManager.resetSettings(); //-> apaga as config salvas -> >>>>>>>USAR ANTES DE FAZER UM NOVO UPLOAD<<<<<<<<
  //callback para quando entra em modo de configuração AP
  wifiManager.setAPCallback(configModeCallback); 
  //callback para quando se conecta em uma rede, ou seja, quando passa a trabalhar em modo estação
  wifiManager.setSaveConfigCallback(saveConfigCallback); 
  wifiManager.autoConnect("ESTUFA", "87654321"); //define um nome e senha para o ponto de acesso   
}

void wifi_test_con() {
   while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");  
}

void mqtt_connect_broker() {
  client.setServer(BROKER_MQTT, 1883);                                  
  client.setCallback(callback);
  connectmqtt();
}

//loop_functions_______________________________________________________________________________________
void sub_pub() {
  connectmqtt();
  
  //client.loop();                                                         
  long now = millis();                                                   
  if (now - lastMsg > 5000) {                                            
    lastMsg = now;                                                       
    ++value;                                                             
    snprintf (msg, 120, "{\"code\": \"%s\", \"tipo\": %s, \"temp\": %f, \"umidade_ar\": %f, \"umidade_solo\": %f}", serial_code_estufa,tipo,temperatura_json,umidade_ar,umidade_solo);//MENSAGEM_A_SER_ENVIADA              
    Serial.print("Publica mensagem: "); //%ld -> int                                 
    Serial.println(msg);                                                 
    client.publish("pub_do_esp8266_ifal_ca", msg);                        
  }  
    client.loop();
}


//SETUP<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
void setup() {
  Serial.begin(9600);
  wifi_manager_config();
  wifi_test_con();
  mqtt_connect_broker();
  iniciar_sensor_th();

  

}
//LOOP<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
void loop() {
  sub_pub();
  ler_sensor_th();
  



}
//funções_WifiManager-----------------------------------------------------------------------------------------------------
void configModeCallback (WiFiManager *myWiFiManager) {  
  Serial.println("Entrou no modo de configuração");
  Serial.println(WiFi.softAPIP()); //imprime o IP do AP
  Serial.println(myWiFiManager->getConfigPortalSSID()); //imprime o SSID criado da rede
}
 
//Callback que indica que salvamos uma nova rede para se conectar (modo estação)
void saveConfigCallback () {
  Serial.println("Configuração salva");
}

//funções_mqtt------------------------------------------------------------------------
void connectmqtt()
{
  client.connect("ESP8266Client-");
  {
       if (!client.connected()) 
  {
    reconnect();
  }
}
}
