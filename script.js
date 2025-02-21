const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const timerDisplay = document.getElementById('time-left');

let maze = [];
let player = { x: 1, y: 1, size: 20, speed: 1 };
let mazeSize = 25; // Labirinto maior
let gameInterval;
let timeLeft = 60;
let gameOver = false;
let obstacles = [];
let powerUps = [];
let teleportCooldown = false;

// Função para gerar o labirinto
function generateMaze() {
    maze = [];
    obstacles = [];
    powerUps = [];
    
    // Preenche o labirinto com paredes aleatórias
    for (let row = 0; row < mazeSize; row++) {
        maze[row] = [];
        for (let col = 0; col < mazeSize; col++) {
            maze[row][col] = Math.random() < 0.25 ? 1 : 0; // 1 = parede, 0 = caminho
        }
    }

    // Garante que o início e o fim sejam caminhos livres
    maze[0][0] = 0;
    maze[mazeSize - 1][mazeSize - 1] = 0;

    // Gera obstáculos letais
    for (let i = 0; i < mazeSize * 2; i++) {
        let x = Math.floor(Math.random() * mazeSize);
        let y = Math.floor(Math.random() * mazeSize);
        if (maze[y][x] === 0 && (x !== 0 || y !== 0) && (x !== mazeSize - 1 || y !== mazeSize - 1)) {
            obstacles.push({ x, y });
        }
    }

    // Gera power-ups aleatórios
    for (let i = 0; i < mazeSize / 3; i++) {
        let x = Math.floor(Math.random() * mazeSize);
        let y = Math.floor(Math.random() * mazeSize);
        if (maze[y][x] === 0 && (x !== 0 || y !== 0) && (x !== mazeSize - 1 || y !== mazeSize - 1)) {
            powerUps.push({ x, y, type: Math.random() < 0.5 ? 'teleport' : 'shield' });
        }
    }
}

// Função para desenhar o labirinto
function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = canvas.width / mazeSize;

    // Desenha as paredes e caminhos
    for (let row = 0; row < mazeSize; row++) {
        for (let col = 0; col < mazeSize; col++) {
            ctx.fillStyle = maze[row][col] === 1 ? '#333' : '#eee';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Desenha obstáculos (armadilhas letais)
    obstacles.forEach(obs => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obs.x * cellSize, obs.y * cellSize, cellSize, cellSize);
    });

    // Desenha power-ups
    powerUps.forEach(pu => {
        ctx.beginPath();
        ctx.arc(pu.x * cellSize + cellSize / 2, pu.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
        ctx.fillStyle = pu.type === 'teleport' ? 'blue' : 'green';
        ctx.fill();
    });

    // Desenha o jogador
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
}

// Função para mover o jogador
function movePlayer(direction) {
    if (gameOver) return;

    let newX = player.x;
    let newY = player.y;

    if (direction === 'up' && newY > 0 && maze[newY - 1][newX] !== 1) newY--;
    else if (direction === 'down' && newY < mazeSize - 1 && maze[newY + 1][newX] !== 1) newY++;
    else if (direction === 'left' && newX > 0 && maze[newY][newX - 1] !== 1) newX--;
    else if (direction === 'right' && newX < mazeSize - 1 && maze[newY][newX + 1] !== 1) newX++;

    // Verifica se o jogador colidiu com um obstáculo
    obstacles.forEach(obs => {
        if (obs.x === newX && obs.y === newY) {
            if (!player.shield) {
                gameOver = true;
                alert('Você colidiu com uma armadilha, seu jumento, é cego agora?.');
            }
        }
    });

    // Verifica se o jogador pegou um power-up
    powerUps.forEach((pu, idx) => {
        if (pu.x === newX && pu.y === newY) {
            if (pu.type === 'teleport' && !teleportCooldown) {
                player.x = Math.floor(Math.random() * mazeSize);
                player.y = Math.floor(Math.random() * mazeSize);
                teleportCooldown = true;
                setTimeout(() => teleportCooldown = false, 3000); // 3 segundos de cooldown
            } else if (pu.type === 'shield') {
                player.shield = true;
                setTimeout(() => player.shield = false, 5000); // 5 segundos de escudo
            }
            powerUps.splice(idx, 1);
        }
    });

    // Atualiza a posição do jogador
    player.x = newX;
    player.y = newY;

    // Verifica se o jogador chegou à saída
    if (player.x === mazeSize - 1 && player.y === mazeSize - 1) {
        clearInterval(gameInterval);
        alert('Parabéns!corno, conseguiu porraa!');
        gameOver = true;
    }

    drawMaze();
}

// Função para iniciar o jogo
function startGame() {
    gameOver = false;
    player = { x: 1, y: 1, size: 20, speed: 1 };
    mazeSize = 25;  // Tamanho maior do labirinto
    generateMaze();
    drawMaze();

    gameInterval = setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            timerDisplay.innerText = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(gameInterval);
                alert('Tempo esgotado!FILHA DA PUTA, fica ai moscano arrombado, isso que dá.');
                gameOver = true;
            }
        }
    }, 1000);
}

// Adicionar controles de movimento
document.getElementById('up').addEventListener('click', () => movePlayer('up'));
document.getElementById('down').addEventListener('click', () => movePlayer('down'));
document.getElementById('left').addEventListener('click', () => movePlayer('left'));
document.getElementById('right').addEventListener('click', () => movePlayer('right'));

// Iniciar o jogo quando o botão for pressionado
startButton.addEventListener('click', startGame);
