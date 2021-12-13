var body = document.getElementById("body")
var type_plant = "default"
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

//dados_grafico------------------------



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

		var title_text = document.createTextNode("Estufa automatizada   monitoramento") //p_title text
		title.appendChild(title_text)
		startbox.appendChild(title)

		var send_code = document.createElement("p") //send_code
		send_code.classList.add("send_code")
		var send_code_text = document.createTextNode("Insira aqui o código da estufa")
		send_code.appendChild(send_code_text)
		startbox.appendChild(send_code)

		var input = document.createElement("input") //input
		input.placeholder = "Ex: esp123"
		input.id = "code"
		startbox.appendChild(input)

		var button = document.createElement("button") //button
		button.id = "send"
		var button_text = document.createTextNode("Entrar")
		button.appendChild(button_text)
		startbox.appendChild(button)
		button.onclick = function but() {
			verificar(document.getElementById("code").value)
		}

		var help = document.createElement("p") //help 1
		help.classList.add("help")
		help.onclick = function alerta() {alert('O codigo da estufa é um codigo o qual vêm junto à própria estufa e'+ 
		' é responsável pela conexão ao sistema de monitoramento')}
		var help_text = document.createTextNode("O que é o código de estufa?")
		help.appendChild(help_text)
		startbox.appendChild(help)

		var help2 = document.createElement("p") //help 2
		help2.classList.add("help")
		help2.onclick = function alerta() {alert('1 - Ligue a estufa à eletricidade;   2 - A estufa irá gerar um ponto'+ 
			"de acesso com o nome (ESTUFA) e senha (87654321);   3 - após acessar a rede, abra o navegador e acesse o"+ 
			'seguinte link: 192.168.4.1;   4 - Configure a rede wifi à qual a estufa irá se conectar;   5 - Pronto!')}
		var help2_text = document.createTextNode("Como posso conectar minha estufa à internet?")
		help2.appendChild(help2_text)
		startbox.appendChild(help2)

		var header = document.createElement("div") //header
		header.classList.add("header")
		var header_p = document.createElement("p")
		header_p.classList.add("credit")
		var header_p_text = document.createTextNode("Estufa de monitoramento com Esp8266/Esp32")
		header_p.appendChild(header_p_text)
		header.appendChild(header_p)

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
		var header_p_text = document.createTextNode("Estufa de monitoramento com Esp8266/Esp32")
		header_p.appendChild(header_p_text)
		header.appendChild(header_p)
		body.appendChild(header)

		var container = document.createElement("div") //container
		container.classList.add("container")

		var pagebox = document.createElement("div") //pagebox
		pagebox.classList.add("pagebox")

		var exit = document.createElement("button") //exit button
		exit.id = "exit"
		exit_text = document.createTextNode("Sair")
		exit.appendChild(exit_text)
		exit.onclick = function ex() {exit_page()}
		pagebox.appendChild(exit)

		var type = document.createElement("p") //tipo de planta
		type.id = "type"                        
		pegar_tipo(codigo)
		var type_text;
		setTimeout(()=> {type_text = document.createTextNode(type_plant)
		type.appendChild(type_text)
		pagebox.appendChild(type)
	},1200)

		var p_temp = document.createElement("p") //titulo de temperatura
		p_temp.classList.add("t_text")
		var p_temp_text = document.createTextNode("Temperatura")
		p_temp.appendChild(p_temp_text)
		pagebox.appendChild(p_temp)

		setInterval(()=>{temper()},500) //verificar temperatura
		pagebox.appendChild(circle)

		var p_temp2 = document.createElement("p") //titulo de umidade
		p_temp2.classList.add("t_text2")
		var p_temp_text2 = document.createTextNode("Umidade do ar")
		p_temp2.appendChild(p_temp_text2)
		pagebox.appendChild(p_temp2)

		setInterval(()=>{umida()},500) //verificar umidade
		pagebox.appendChild(circle2)

		var p_temp3 = document.createElement("p") //titulo de umidade_solo
		p_temp3.classList.add("t_text3")
		var p_temp_text3 = document.createTextNode("Umidade do solo")
		p_temp3.appendChild(p_temp_text3)
		pagebox.appendChild(p_temp3)

		setInterval(()=>{umidasolo()},500) //verificar umidade do solo
		pagebox.appendChild(circle3)
                          
		


		var new_header_p_text = document.createTextNode("Conectado a "+codigo) //ultimos appendChild
		header_p.innerHTML = ""
		container.appendChild(pagebox)
		header_p.appendChild(new_header_p_text)
		body.appendChild(container)
}

//verificar-------------------------------------
function verificar(code) {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', '/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var antiloop = 0
            //console.log(result)
            result.forEach(function array(obj) {
				if (obj!=null) {
				if(code==obj.code) {
					if (antiloop==0) {
					localStorage.setItem("esp8266_code", obj.code)
					renderizartelademonitoramento(code); antiloop=1}
				}
				else {if (antiloop>=result.length) {alert("codigo não encontrado, tente novamente"); ++antiloop}
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

	xhr.open('GET', '/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var value = 0
            //console.log(result)
            result.forEach(function ok(obj) {
            	if (obj!=null) {
            	if (obj.code==codigo && value==0) {
            		if (obj.tipo==0) {type_plant = "Planta - Alface"; value=1} //tipos
            	}
              }
            })

        }
    }
};

xhr.send();

}

//exit_button---------------------------
function exit_page() {
	localStorage.removeItem("esp8266_code")
	telainicial()
}

//ver_temperatura------------------------
function temper() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', '/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var antiloop = 0
            result.forEach(function ok(obj) {
            	if (obj!=null) {
            		if (obj.code==localStorage.getItem("esp8266_code")) {
            			if (antiloop==0) {
            				temperatura.innerHTML = obj.temp.toFixed(2) + "°C"; antiloop = 1;
            			}
            		}
            	}
            })
            //console.log(result)
        }
    }
};

xhr.send();

}

//umidade-------------------------------------------------
function umida() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', '/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var antiloop = 0
            result.forEach(function ok(obj) {
            	if (obj!=null) {
            		if (obj.code==localStorage.getItem("esp8266_code")) {
            			if (antiloop==0) {
            				umidade.innerHTML = obj.umidade_ar.toFixed(2) + "%"; antiloop = 1;
            			}
            		}
            	}
            })	
            //console.log(result)
        }
    }
};

xhr.send();

}

//umidade_solo-------------------------------------------------
function umidasolo() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', '/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var antiloop = 0
            result.forEach(function ok(obj) {
            	if (obj!=null) {
            		if (obj.code==localStorage.getItem("esp8266_code")) {
            			if (antiloop==0) {
            				umidade_solo.innerHTML = obj.umidade_solo.toFixed(2) + "%"; antiloop = 1;
            			}
            		}
            	}
            })	
            //console.log(result)
        }
    }
};

xhr.send();

}

//gerar_grafico-------------------------------------------------











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