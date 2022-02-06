
//tela usada para desenhar o estado do jogo
var ctx;

//Algumas variaveis usado para definir os parâmetros do jogo. 
var config = new Object();
config.grid_size = 20;
config.number_obstacles = 12;
config.square_size = 25;
config.snake_length = 5;
config.search = 'BFS';
config.runTimeout = 0;

function init() {
    ctx = document.getElementById('canvas').getContext("2d");
    //diga ao worker para se estabelecer
    var message = new Object();
    message.do = 'init';
    message.config = config;
    worker.postMessage(message);
    
}

//Redesenhe a tela com base no estado do jogo, que é passado do worker
function refresh_view(data) {
    //parar quando chegarmos a 50
    console.log(data);
    if (data.stats.food >= 50)
        stop();
    //gerar algumas estatísticas sobre nosso desempenho
    
    //desenhe os quadrados, cor com base no tipo de quadrado
    for (var i = 0; i < config.grid_size; i++) {
        for (var j = 0; j < config.grid_size; j++) {
            switch (data.squares[i][j]) {
                case 0:
                    //vazio
                    ctx.fillStyle = "#e1d6f6";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size - 1, config.square_size - 1);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fillStyle = "#c8a2c8";
                    ctx.stroke();
                    ctx.strokeStyle = "#c8a2c8";
                    break;
                case 1:
                    //caminho
                    ctx.fillStyle = "#c8a2c8";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 3:
                    //parede
                    ctx.fillStyle = "#c8a2c8";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 2:
                    //comida
                    ctx.fillStyle = "red";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 4:
                    //obstaculo
                    ctx.fillStyle = "#0000A0";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fill();
                    break;
                default:
                    if (data.squares[i][j] == 5) {
                        //cabeca
                        ctx.fillStyle = "blueviolet";
                        ctx.beginPath();
                        ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    }
                    if (data.squares[i][j] == 10) {
                        //cauda
                        ctx.fillStyle = "#0000A0";
                        ctx.beginPath();
                        ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    }
                    //corpo
                    ctx.fillStyle = "blueviolet";
                    ctx.beginPath();
                    ctx.rect(i * config.square_size, j * config.square_size, config.square_size, config.square_size);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }
    }
}

//crie um worker que fará o processamento
var worker = new Worker("grid.js");

//quando o worker enviar uma mensagem, aja de acordo com ela.
worker.onmessage = function (event) {
    //se for um movimento, redesenhe a tela com base no estado passado
    if (event.data.type == 'move')
        refresh_view(event.data);
    else
        console.log(event.data);
    //caso contrário, é um erro, envie para o console para que possamos ver no firebug
};

//se o worker relatar um erro, registre-o no firebug
worker.onerror = function (error) {
    console.log(error.message);
};

//envia uma mensagem de início ao worker. O trabalhador começará a processar até que seja instruído a parar.
function start() {
    var message = new Object();
    message.do = 'start';
    worker.postMessage(message);
}

//parar o worker. Ele será 'pausado' e esperará até que seja dito para começar novamente. Estado será mantido
function stop() {
    var message = new Object();
    message.do = 'stop';
    worker.postMessage(message);
}

function resume() {
    var message = new Object();
    message.do = 'resume';
    worker.postMessage(message);
}
