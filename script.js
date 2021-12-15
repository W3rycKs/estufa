var body = document.getElementById("body")
var type_plant = "default"

//pagebox------------------------------
var pagebox = document.createElement("div") //pagebox
pagebox.classList.add("pagebox")

var p_temp4 = document.createElement("p")
p_temp4.classList.add("t_text4")

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

		var exit = document.createElement("button") //exit button
		exit.id = "exit"
		exit_text = document.createTextNode("Sair")
		exit.appendChild(exit_text)
		exit.onclick = function ex() {exit_page()}
		pagebox.appendChild(exit)

		pegar_tipo(codigo)

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
                          
		valores_grafico(codigo)

		var new_header_p_text = document.createTextNode("Conectado a "+codigo) //ultimos appendChild
		header_p.innerHTML = ""
		container.appendChild(pagebox)
		header_p.appendChild(new_header_p_text)
		body.appendChild(container)
}

//verificar-------------------------------------
function verificar(code) {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/dados');

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
					renderizartelademonitoramento(code); ++antiloop
					alert("login feito com sucesso!")}
				}
				else {if (localStorage.getItem("esp8266_code")==null && antiloop==0) {
					alert("codigo não encontrado, tente novamente"); ++antiloop
				}
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

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/dados');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            var value = 0
            //console.log(result)
            result.forEach(function ok(obj) {
            	if (obj!=null) {
            	if (obj.code==codigo && value==0) {
            		if (obj.tipo==0) {type_plant = "Planta - Alface"; value=1
            				var type = document.createElement("p") //tipo de planta
							type.id = "type"                        
							var type_text;
							type_text = document.createTextNode(type_plant)
							type.appendChild(type_text)
							pagebox.appendChild(type)
            		} //tipos
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
	setTimeout(()=>{document.location.reload()},500)
}

//ver_temperatura------------------------
function temper() {
	let xhr = new XMLHttpRequest();

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/dados');

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

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/dados');

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

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/dados');

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

//valores_grafico-------------------------------------------------
function valores_grafico(code) {
	var array = []
	//requisição
	let xhr = new XMLHttpRequest()

	xhr.open('GET', 'https://estufaautomatizadaifalca.herokuapp.com/lista');

	xhr.onreadystatechange = () => {
    	if(xhr.readyState == 4) {
        	if(xhr.status == 200) {
            var result = JSON.parse(xhr.responseText);
            //console.log(result[0])
            if (result.code==undefined) {
            result.forEach((obj)=>{
            	if (obj!=null) {
            		if (obj.code==code) {
            			array.push(obj)
            		}
            	}
            })

            //inicio
            if (array.length<17280) {status = 1} //-------------> texto dos graficos/temp
            if (array.length>=17280 && array.length<51840) {status = 2}
            if (array.length>=51840) {status = 3}
            	p_temp4.innerHTML = "Processando gráficos... Aguarde"
            	pagebox.appendChild(p_temp4)		     

            //console.log(array.length)
            var tam = Math.floor(array.length/50)
            //console.log(tam)
            var add = 0
            var newarray = []
            var test = 0

            while (test==0) {
            	++add
            	if (add==tam) {
            		newarray.push(array[add-1])
            		add = 0
            		for (var n1=0; n1<49; n1++) {array.shift()}
            		if (newarray.length>=tam) {test=1; desenhar_temperatura(newarray);desenhar_umidade(newarray)}
            	}
            } 
         //final
     }
     else {valores_grafico(code)}
    }
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
	ctx.strokeStyle = "#b85151";
	ctx.lineTo(x, altura-(valor)*3);
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, 30);
	ctx.fillStyle = "#b85151";
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
	ctx.strokeStyle = "#94705a";
	ctx.lineTo(x, altura-(valor*3));
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, largura, 30);
	ctx.fillStyle = "#94705a";
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