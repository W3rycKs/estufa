//MODULOS-------------------------------
var express = require("express")
const  mqtt = require ('mqtt')
const mongoose = require('mongoose')

var http = require("http"), app
app = express()

app.use(express.urlencoded())
app.use(express.static(__dirname))

var porta = process.env.PORT || 8080 //--> porta

var data;
var valor = 0
var array_json = {}
var json_for_send = []

//start_banco-----------------------------------------------
var url_m = process.env.MONGODB_URI

mongoose.connect(url_m) 

const Schema = mongoose.Schema // |-> process.env.MONGO_URL_CON
const esp8266_schema = new Schema({
code : String,
tipo : String,
temp : Number,
umidade_ar: Number,
umidade_solo: Number
})
const Model = mongoose.model

const dados = Model("esps",esp8266_schema) //-----> nome do banco
data = dados;

//-------------

//MQTT------------------------------------------------------ |-> process.env.MQTT_URL_CON
var client = mqtt.connect(process.env.BROKER_CON)//('mqtt://broker.hivemq.com')//('mqtt://broker.mqtt-dashboard.com') ->
var topic = process.env.MQTT_URL_CON //'pub_do_esp8266_ifal_ca'-------->topico de publicação

client.on('message', (topic, message)=>{
	message = message.toString()
	objeto = JSON.parse(message) //_____________>MENSAGEM_DO_ESP8266 
	console.log(objeto);
	array_json = objeto;
	save_on_bank(objeto)
	find_bank(objeto);
})

client.on('connect', ()=>{
	client.subscribe(topic)
})

//BANCO_DE_DADOS-----------------------------------------------------------------------
function save_on_bank(obj) {const send_bank = new data(obj)
send_bank.save((err,result)=>{
    if(err) console.log(err)
    console.log(result);
})
}
var nm = 100 //numero mensagens
//pegar_json_do_banco
function find_bank(obj) {
	data.find((err,document)=> {
		//console.log(document)
		array_json = document;
		if (array_json.length<nm) {json_for_send = array_json}
		else {
		for (var n1=array_json.length; n1>=array_json.length-nm; --n1) {json_for_send.push(array_json[n1])}//>ultimas 20 mensagens
		if (json_for_send.length>=nm*2) {for (var n1=0; n1<=nm; ++n1) {json_for_send.shift()}}	
		if (array_json.length>=128000) { //----> caso ultrapasse os 512Mb da versão gratuita (numero de mensagens salvas)
			data.deleteMany((err,result)=>{
				if(err) {console.log(err)}
				console.log("apagar_tudo")
			})
		}
	  }
	})
}


//publicar_JSON_para_a_aplicação-----------------------|
app.get("/dados", function(req,res) {               // |
	res.json(json_for_send)
	//res.json(array_json[array_json.length-1])     // |
})                                                  // |
//publicar_lista_completa------------------------------| ENVIA OS DADOS PARA LINKS DO SERVIDOR
app.get("/lista", function(req,res){                // |
	res.json(array_json)                            // |
})                                                  // |
//-----------------------------------------------------|

//criarWebserver----------------------------------------------------------------------

http.createServer(app).listen(porta)
console.log("server_funcionando");


