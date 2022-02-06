function Point(pos_x, pos_y) {
    this.x = pos_x;
    this.y = pos_y;
}
//Function No , usada para pesquisa.
function No(parent, point, children, g_score, h_score) {
    this.parent = parent;
    this.point = point;
    this.children = children;
    this.g_score = g_score;
    this.h_score = h_score;
    this.f_score = g_score + h_score;
}

//algumas variaveis 
var config = new Object();
var stats = new Object();
var moves = new Array();
var squares;
var snake;
var food;
var length = 0;
stats.moves = 0;
stats.food = 0;
stats.count = 0;



//inicializar estado do campo.
function init() {
    squares = new Array(config.grid_size);
    for (var i = 0; i < config.grid_size; i++) {
        squares[i] = new Array(config.grid_size);
    }
    //inicializar valores quadrados, definir paredes
    for (var i = 0; i < config.grid_size; i++) {
        for (var j = 0; j < config.grid_size; j++) {
            if (i == 0 || j == 0 || i == config.grid_size - 1 || j == config.grid_size - 1) {
                squares[i][j] = 3;
            } else {
                squares[i][j] = 0;
            }
        }
    }

    //Lugar da cobra, obstaculos e comida
    snake = place_snake(config.snake_length);
    place_obstacles(config.number_obstacles);
    place_food();
    refresh_view();
}

//funcao que e chamada sempre que o trabalhador recebe uma mensagem.
onmessage = function (event) {
    console.log(event.data.do);
    switch (event.data.do) {
        case 'start':
            start();
            break;
        case 'stop':
            stop();
            break;
        case 'resume':
            resume();
            break;

        case 'init':
            config = event.data.config;
            init();
            break;
        case 'set_search':
            config.search = event.data.search;
            break;
    }
}

//Funcao que sempre é chamada, Verifica se devemos nos mover, ou procurar mais movimentos, e executa os movimentos.
function run() {
    //Parar em 50 comidas
    if (stats.food >= 50) {
        clearTimeout(config.runTimeout);
        return;
    }
    //moves é uma lista de movimentos que a cobra deve realizar. Se não houver movimentos restantes, faça uma pesquisa para encontrar mais.
    if (moves.length == 0) {
        if (config.search) {
            findpath_bfs();
        }
    } else {
        //ainda existe movimentos restantes, então mova a cobra para o próximo quadrado.
        move(moves.shift());
    }
    //Enviar o novo estado no navegador
    refresh_view();
    //espere e então continue com o próximo movimento.
    clearTimeout(config.runTimeout);
    config.runTimeout = setTimeout(run, 100);
}

//Breadth First Search
function findpath_bfs() {
    postMessage("running BFS");
    // Criando nossas listas abertas e fechadas
    var openList = new Array();
    var closedList = new Array(config.grid_size);
    for (var i = 0; i < config.grid_size; i++) {
        closedList[i] = new Array(config.grid_size);
    }
    //inicializar valores closedList como 0
    for (var i = 0; i < config.grid_size; i++) {
        for (var j = 0; j < config.grid_size; j++) {
            closedList[i][j] = 0;
        }
    }


    // Adicionando o ponto de partida à lista aberta
    openList.push(new No(null, snake[0], new Array()));
    // loop enquanto openList contém alguns dados.
    while (openList.length != 0) {
        var n = openList.shift();
        if (closedList[n.point.x][n.point.y] == 1)
            continue;
        stats.count++;
        // Verifique se o nó é comida
        if (squares[n.point.x][n.point.y] == 2) {

            //se chegamos a comida, suba na árvore até a raiz para obter caminho
            do {
                moves.unshift(n.point);
                if (squares[n.point.x][n.point.y] == 0)
                    squares[n.point.x][n.point.y] = 1;
                n = n.parent;
            } while (n.parent != null);
            break;
        }
        // Adicionar nó atual a closedList
        closedList[n.point.x][n.point.y] = 1;

        // Adicione nós adjacentes à lista aberta a ser processada.
        if (closedList[n.point.x][n.point.y - 1] == 0 && (squares[n.point.x][n.point.y - 1] == 0 || squares[n.point.x][n.point.y - 1] == 2))
            n.children.unshift(new No(n, new Point(n.point.x, n.point.y - 1), new Array()));

        if (closedList[n.point.x + 1][n.point.y] == 0 && (squares[n.point.x + 1][n.point.y] == 0 || squares[n.point.x + 1][n.point.y] == 2))
            n.children.unshift(new No(n, new Point(n.point.x + 1, n.point.y), new Array()));

        if (closedList[n.point.x][n.point.y + 1] == 0 && (squares[n.point.x][n.point.y + 1] == 0 || squares[n.point.x][n.point.y + 1] == 2))
            n.children.unshift(new No(n, new Point(n.point.x, n.point.y + 1), new Array()));

        if (closedList[n.point.x - 1][n.point.y] == 0 && (squares[n.point.x - 1][n.point.y] == 0 || squares[n.point.x - 1][n.point.y] == 2))
            n.children.unshift(new No(n, new Point(n.point.x - 1, n.point.y), new Array()));
        for (var i = 0; i < n.children.length; i++) {
            openList.push(n.children[i]);
        }
    }
}


//checar se aNode está em openList. Se uma correspondência for encontrada, retorna i, -1 se não houver correspondência
function in_openlist(openList, aNode) {
    for (var i = 0; i < openList.length; i++) {
        if (openList[i].point.x == aNode.point.x && openList[i].point.y == aNode.point.y)
            return i;
    }
    return -1;
}

//inicializando function start
function start() {
    init();
    config.runTimeout = setTimeout(run, 100);
    stats.moves = 0;
    stats.food = 0;
    stats.count = 0;
}


function resume() {
    config.runTimeout = setTimeout(run, 100);
}

//parar function run
function stop() {
    clearTimeout(config.runTimeout);
}

//enviar as informações do estado atual para o navegador para redesenhar o estado mais recente.
function refresh_view() {
    var message = new Object();
    message.type = 'move';
    message.squares = squares;
    message.stats = stats;
    postMessage(message);
}

//mova a cobra para o novo ponto dado
function move(new_head) {
    //verifique se este é um movimento é permitido. O quadrado deve ser adjacente e vazio (pode se mover para vazio, comida ou caminho.
    if ((!is_adjacent(new_head, snake[0])) || squares[new_head.x][new_head.y] > 2) {
        return false;
    }
    //se a cobra ter comido uma comida, coloque uma nova comida na grade
    if (squares[new_head.x][new_head.y] == 2) {
        place_food();

        stats.food++
    }

    //limpar a cauda
    squares[snake[snake.length - 1].x][snake[snake.length - 1].y] = 0;

    //mover a cobra para frente


    for (var i = snake.length - 1; i > 0; i--) {
        snake[i].x = snake[i - 1].x;
        snake[i].y = snake[i - 1].y;
    }
    snake[0].x = new_head.x;
    snake[0].y = new_head.y;
    //atualizar quadrados com novas informações de cobra 
    for (var i = 0; i < snake.length; i++) {
        squares[snake[i].x][snake[i].y] = 5 + i;
    }

    stats.moves++;
    return true;
}


// função verificar se dois pontos são adjacentes. Usado para verificar se os movimentos são legais.
function is_adjacent(point1, point2) {
    if (point1.x == point2.x && (point1.y == point2.y - 1 || point1.y == point2.y + 1))
        return true;
    if (point1.y == point2.y && (point1.x == point2.x - 1 || point1.x == point2.x + 1))
        return true;
    return false;
}

//colocar a cobra no campo. 
function place_snake(length) {
    var middle_x = Math.floor(config.grid_size / 2);
    var middle_y = Math.floor(config.grid_size / 2);
    var snake = new Array(length);
    while (length) {
        squares[middle_x + length][middle_y] = 4 + length;
        snake[length - 1] = new Point(middle_x + length, middle_y);
        length--;
    }
    return snake;
}

//colocar obstáculos aleatoriamente na grade.
function place_obstacles(count, flag) {

    for (var c = 0; c < count;) {
        var random_x = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
        var random_y = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
        if (squares[random_x][random_y] == 0) {
            squares[random_x][random_y] = 4;
            c++;
        }
    }
}

//coloque aleatoriamente uma comida na grade.
function place_food() {
    do {
        var random_x = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
        var random_y = Math.floor(Math.random() * (config.grid_size - 2)) + 1;
    } while (squares[random_x][random_y] != 0);
    squares[random_x][random_y] = 2;
    food = new Point(random_x, random_y);
}

