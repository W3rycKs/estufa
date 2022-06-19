var body = document.getElementById("body")
var type_plant = ""
//verificar_umidade_solo---------------
var contador_umidade = 0;

//pagebox------------------------------
var pagebox = document.createElement("div") //pagebox
pagebox.classList.add("pagebox")

var p_temp4 = document.createElement("p")
p_temp4.classList.add("t_text4")
p_temp4.innerHTML = "Processando gráficos, aguarde..."

var p_temp5 = document.createElement("p")
p_temp5.classList.add("t_text5")
var status;

//temperatura--------------------------
var circle = document.createElement("div")
circle.classList.add("circle")
var temperatura = document.createElement("p")
temperatura.id = "temperatura"
circle.appendChild(temperatura)

//umidade_ar---------------------------
var circle2 = document.createElement("div")
circle2.classList.add("circle2")
var umidade = document.createElement("p")
umidade.id = "umidade"
circle2.appendChild(umidade)

//umidade_solo-------------------------
var circle3 = document.createElement("div")
circle3.classList.add("circle3")
var umidade_solo = document.createElement("p")
umidade_solo.id = "umidade_solo"
circle3.appendChild(umidade_solo)

//loading------------------------------
var loading = document.createElement("img")
loading.classList.add("loading")
loading.src = "loading.gif"


//tela_de_inicio-----------------------
telainicial()
function telainicial() {
if (localStorage.getItem("esp8266_code")==null) {
		temperatura.innerHTML = 0.0
		umidade.innerHTML = 0.0
		umidade_solo.innerHTML = 0.0

		body.innerHTML = ""
		var container = document.createElement("div") //container
		container.classList.add("container")

		var startbox = document.createElement("div") //startbox
		startbox.classList.add("startbox")
		container.appendChild(startbox)

		var title = document.createElement("p") //p_title
		title.classList.add("title")

		 //p_title text
		title.innerHTML = "Estufa automatizada   monitoramento"
		startbox.appendChild(title)

		var send_code = document.createElement("p") //send_code
		send_code.classList.add("send_code")
		send_code.innerHTML = "Insira aqui o código da estufa"
		startbox.appendChild(send_code)

		var input = document.createElement("input") //input
		input.placeholder = "Ex: esp123"
		input.id = "code"
		startbox.appendChild(input)

		var button = document.createElement("button") //button
		button.id = "send"
		button.innerHTML = "Entrar"
		startbox.appendChild(button)
		button.onclick = function but() {
			verificar(document.getElementById("code").value)
		}

		var help = document.createElement("p") //help 1
		help.classList.add("help")
		help.onclick = function alerta() {alert('O codigo da estufa é um codigo o qual vêm junto à própria estufa e'+ 
		' é responsável pela conexão ao sistema de monitoramento')}
		help.innerHTML = "O que é o código de estufa?"
		startbox.appendChild(help)

		var help2 = document.createElement("p") //help 2
		help2.classList.add("help")
		help2.onclick = function alerta() {alert('1 - Ligue a estufa à eletricidade;   2 - A estufa irá gerar um ponto'+ 
			"de acesso com o nome (ESTUFA) e senha (87654321);   3 - após acessar a rede, abra o navegador e acesse o"+ 
			'seguinte link: 192.168.4.1;   4 - Configure a rede wifi à qual a estufa irá se conectar;   5 - Pronto!')}
		help2.innerHTML = "Como posso conectar minha estufa à internet?"
		startbox.appendChild(help2)

		var header = document.createElement("div") //header
		header.classList.add("header")
		var header_p = document.createElement("p")
		header_p.classList.add("credit")
		header_p.innerHTML = "Estufa de monitoramento com Esp8266/Esp32"
		header.appendChild(header_p)

		//loading
		loading.style.display = "none"
		startbox.appendChild(loading)

		body.appendChild(header)
		body.appendChild(container)
	}
	else {renderizartelademonitoramento(localStorage.getItem("esp8266_code"));}
}

//tela_de_monitoramento--------------------------
function renderizartelademonitoramento(codigo) {
		body.innerHTML = ""

		var header = document.createElement("div") //header
		header.classList.add("header")
		var header_p = document.createElement("p")
		header_p.classList.add("credit")
		header_p.innerHTML = "Estufa de monitoramento com Esp8266/Esp32"
		header.appendChild(header_p)
		body.appendChild(header)

		var container = document.createElement("div") //container
		container.classList.add("container")

		var exit = document.createElement("button") //exit button
		exit.id = "exit"
		exit.innerHTML = "Sair"
		exit.onclick = function ex() {exit_page()}
		pagebox.appendChild(exit)

		pegar_tipo(codigo)

		var p_temp = document.createElement("p") //titulo de temperatura
		p_temp.classList.add("t_text")
		p_temp.innerHTML = "Temperatura"
		pagebox.appendChild(p_temp)

		setInterval(()=>{temper();},500) //verificar temperatura
		pagebox.appendChild(circle)

		var p_temp2 = document.createElement("p") //titulo de umidade
		p_temp2.classList.add("t_text2")
		p_temp2.innerHTML = "Umidade do ar"
		pagebox.appendChild(p_temp2)

		setInterval(()=>{umida()},500) //verificar umidade
		pagebox.appendChild(circle2)

		var p_temp3 = document.createElement("p") //titulo de umidade_solo
		p_temp3.classList.add("t_text3")
		p_temp3.innerHTML = "Umidade do solo"
		pagebox.appendChild(p_temp3)

		setInterval(()=>{umidasolo(); //verificar umidade do solo
			contador_umidade++;
			if (contador_umidade>=1200 && parseFloat(umidade_solo.innerText)<=50.0) {
				alert("Umidade do solo baixa. Verifique a mangueira ou o estoque de água"); 
				contador_umidade = 0;
			}
		},500) 
		pagebox.appendChild(circle3)
                          
		//valores_grafico(codigo)
		post()
		valores_grafico(codigo)

		//ultimos appendChild
		header_p.innerHTML = ""
		container.appendChild(pagebox)
		header_p.innerHTML = "Conectado a "+codigo;
		body.appendChild(container)
}

//verificar-------------------------------------
function verificar(code) {
	loading.style.display = "block"
	let xhr = new XMLHttpRequest();

	xhr.open('GET', '/users');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var antiloop = 0
            var antiloop2 = 0
            //console.log(result)
            result.forEach(function array(obj) {
				if (obj!=null) {
				if(code==obj.code) {
					if (antiloop==0) {
					localStorage.setItem("esp8266_code", obj.code)
					renderizartelademonitoramento(code); antiloop = 1
					alert("login feito com sucesso!")}
				}
				else {if (antiloop2==result.length-1) {
					alert("codigo não encontrado, tente novamente");
					loading.style.display = "none"
				}
				++antiloop2
			}
		}
})
            

        }
    }
};

xhr.send();
}

//pegar_tipo--------------------------------------
function pegar_tipo(codigo) {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', `/at${codigo}`);

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            //console.log(result)
            if (result.code==codigo) {
            	if (result.tipo==0) {type_plant = "Planta - Alface"
            		var type = document.createElement("p") //tipo de planta
					type.id = "type"                        
					var type_text;
					type.innerHTML = type_plant
					pagebox.appendChild(type)  
				}          	
            }
            else {pegar_tipo(codigo)}
        }
    }
};

xhr.send();

}

//exit_button---------------------------
function exit_page() {
	localStorage.removeItem("esp8266_code")
	setTimeout(()=>{document.location.reload()},500)
}

//ver_temperatura------------------------
function temper() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', `/at${localStorage.getItem("esp8266_code")}`);

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            if (result.code==localStorage.getItem("esp8266_code")) {
            	temperatura.innerHTML = result.temp.toFixed(2) + "°C";	
            }
        }
    }
};

xhr.send();

}

//umidade-------------------------------------------------
function umida() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', `/at${localStorage.getItem("esp8266_code")}`);

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            if (result.code==localStorage.getItem("esp8266_code")) {
            	umidade.innerHTML = result.umidade_ar.toFixed(2) + "%";	
            }            
        }
    }
};

xhr.send();

}

//umidade_solo-------------------------------------------------
function umidasolo() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', `/at${localStorage.getItem("esp8266_code")}`);

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            if (result.code==localStorage.getItem("esp8266_code")) {
            	umidade_solo.innerHTML = result.umidade_solo.toFixed(2) + "%";	
            }              
        }
    }
};

xhr.send();

}

//valores_grafico-------------------------------------------------
function valores_grafico(code) {
	var array = []
    pagebox.appendChild(p_temp4)
	//requisição
	let xhr = new XMLHttpRequest()

	xhr.open('GET', `/list${code}`);

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);

            status = result.time
            setTimeout(()=>{desenhar_temperatura(result.values)
            desenhar_umidade(result.values)
            },500)

    }
    else {valores_grafico(code)}
};
}
xhr.send();
}

//desenhargrafico-------------------------------------
function desenhar_temperatura(array) {
	var antl = 0

	var grafico = document.createElement("canvas")
	grafico.id = "grafico"
	var altura = 200;
	var largura = 300;
	var x = 0;
	var valor;
	grafico.setAttribute("width", largura);
	grafico.setAttribute("height", altura);
	var ctx = grafico.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, altura);
	ctx.font = "25px Roboto";
	//console.log(array.length)

	var media = 0

	array.forEach((obj)=>{
	if (obj!=null) {
	x+=5;
	media+=obj.temp
	valor = obj.temp
	ctx.strokeStyle = "#cc3131";
	//var aleatorio = Math.random()+2
	ctx.lineTo(x, altura-(valor*valor/10));
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, 30);
	ctx.fillStyle = "#cc3131";
	}
	})

	media = "Média: " + (media/array.length).toFixed(2) + "°C" 
	ctx.fillText(media, 10, 30);

	pagebox.removeChild(p_temp4)

	if (status==1) {p_temp4.innerHTML = "Temperatura média do último 1 dia"}
	if (status==2) {p_temp4.innerHTML = "Temperatura média dos últimos 2 dias"}
	if (status==3) {p_temp4.innerHTML = "Temperatura média dos últimos 3 dias"} 

	pagebox.appendChild(p_temp4)

	pagebox.appendChild(grafico)

}

//desenhar_umidade------------------------------------
function desenhar_umidade(array) {
	var antl = 0

	var grafico = document.createElement("canvas")
	grafico.id = "grafico2"
	var altura = 200;
	var largura = 300;
	var x = 0;
	var valor;
	grafico.setAttribute("width", largura);
	grafico.setAttribute("height", altura);
	var ctx = grafico.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, altura);
	ctx.font = "25px Roboto";
	//console.log(array.length)

	var media = 0

	array.forEach((obj)=>{
	if (obj!=null) {
	x+=5;
	media+=obj.umidade_solo
	valor = obj.umidade_solo
	ctx.strokeStyle = "#631d1d";
	//var aleatorio = Math.random()+2
	ctx.lineTo(x, altura-(valor*valor/10));
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, 30);
	ctx.fillStyle = "#631d1d";
	}
	})

	media = "Média: " + (media/array.length).toFixed(2) + "%" 
	ctx.fillText(media, 10, 30);	


	if (status==1) {p_temp5.innerHTML = "Umidade do solo média do último 1 dia"}
	if (status==2) {p_temp5.innerHTML = "Umidade do solo média dos últimos 2 dias"}
	if (status==3) {p_temp5.innerHTML = "Umidade do solo média dos últimos 3 dias"} 

	pagebox.appendChild(p_temp5)

	pagebox.appendChild(grafico)

}


//REQUISIÇÃO PARA VALORES DO GRAFICO ------------------------------------
function post() {
	console.log("ok")
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/post", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhr.onreadystatechange = function () {
    if (this.readyState != 4) return;

    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data)
    }
};
var json = JSON.stringify({code:localStorage.getItem("esp8266_code")})
xhr.send(json);
}






//requisição
/*	let xhr = new XMLHttpRequest();

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/lista');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            //console.log(result)
        }
    }
};

xhr.send();
*/

/*var xhr = new XMLHttpRequest();
xhr.open("POST", "/postman", true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({
    value: 'value'
}));
xhr.onload = function() {
  console.log("HELLO")
  console.log(this.responseText);
  var data = JSON.parse(this.responseText);
  console.log(data);
}*/
