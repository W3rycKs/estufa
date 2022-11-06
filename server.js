//MODULOS-------------------------------
var express = require("express")
const  mqtt = require ('mqtt')
const mongoose = require('mongoose')
var bodyParser = require('body-parser')

var http = require("http"), app
app = express()

app.use(express.urlencoded())
app.use(bodyParser.json())
app.use(express.static(__dirname))

var porta = process.env.PORT || 9090 //--> porta

var data;
var valor = 0
var array_json = {}
var usuarios = []


//start_banco-----------------------------------------------
var url_m = process.env.MONGODB_URI//"mongodb+srv://user:S02c4b1L1LACdBRD@cluster0.bcsyl.mongodb.net/?retryWrites=true&w=majority"//

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

//dados dos usuarios --------------
const Esquema = mongoose.Schema // |-> process.env.MONGO_URL_CON
const esp8266_users = new Esquema({
code : String
})
const usuario = mongoose.model('users', esp8266_users); //-----> nome do banco

//MQTT------------------------------------------------------ |-> process.env.MQTT_URL_CON
var client = mqtt.connect("mqtt://broker.mqtt-dashboard.com")//('mqtt://broker.hivemq.com')//('mqtt://broker.mqtt-dashboard.com') ->
var topic = "pub_do_esp8266_ifal_ca"//process.env.MQTT_URL_CON //'pub_do_esp8266_ifal_ca'-------->topico de publicação //S02c4b1L1LACdBRD

client.on('message', (topic, message)=>{
	message = message.toString()
	objeto = JSON.parse(message) //_____________>MENSAGEM_DO_ESP8266 
	//console.log(objeto);
	array_json = objeto;
	save_on_bank(objeto)
	deletar(objeto)
	app.get(`/at${objeto.code}`, function (req,res) {
		res.json(objeto);
	})
	verificar_cadastrar(objeto)
	mostrar_usuarios(objeto)
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

function find_bank(obj) {
	data.find((err,document)=> {
		array_json = document
	})
}

//ENVIAR DADOS DO GRAFICO---------------------------------------------

app.post("/post", function(req,res) {
	var codigo = JSON.stringify(req.body).substring(14, 20)
	console.log(codigo)
	//find(codigo)
	res.json({"status":"ok"})
})

function find(codigo) {
	data.find((err,document)=>{
		if (err) {console.log(err)}
		var array = document
		var array_code = []
		var newarray = []
		var days =""
		if (array.length<=17280) {days="1"}
		if (array.length>17280 && array.length<=34560) {days="2"}
		if (array.length>34560) {days="3"}
		array.forEach(function (obj) {
			if (obj.code==codigo) {
				array_code.push(obj)
			}
		})
		 var tam = Math.floor(array_code.length/60) 
         //console.log(tam)
         var add = 0
         var test = 0
         while (test==0) {
            	++add
            	if (add==tam) {
            		newarray.push(array_code[add-1])
            		add = 0
            		for (var n1=0; n1<59; n1++) {array.shift()}
            		if (newarray.length==tam) {
            			//DADOS PARA O GRAFICO
            			app.get(`/list${codigo}`, function(req,res) {
							res.json({"time":days,"values": newarray})
						})
						test=1
            			//DADOS
            		}
            	}
            }

	})
}

	/*app.get(`/${codigo}`, function(req,res) {
		res.json()
	})*/

	//data.find((err,document)=> {})

//apagar_elementos-----------------------
function deletar(obj) {
	data.find({"code":obj.code},(err,result)=>{
		if (result.length>=51840) {
			data.deleteMany({"code":obj.code},(err,result)=>{
				console.log(result)
			})
		}
	})
}

//cadastar--------------------------------
function verificar_cadastrar(obj) {
	usuario.find((err,document)=> {
		var result = document
		if (result.length<=0) {
			const send_bank = new usuario({"code":obj.code})
			send_bank.save((err,result)=>{
    			if(err) console.log(err)
			})
		}
		else {var add = 0
			result.forEach((codes)=>{
				if (obj.code!=codes.code) {
					++add;
					if (add>=result.length) {
						const send_bank = new usuario({"code":obj.code})
						send_bank.save((err,result)=>{
    						if(err) console.log(err)
						})
					}
				}
			})
		}	
	})
}

function mostrar_usuarios(obj) {
	usuario.find((err,document)=> {
		usuarios = document
	})
}

app.get("/users", function(req,res) {
	res.json(usuarios)
})

//criarWebserver----------------------------------------------------------------------

http.createServer(app).listen(porta)
console.log("server_funcionando");


