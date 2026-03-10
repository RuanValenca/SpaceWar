let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
var windowHeight = (canvas.height = window.innerHeight);
var windowWidth = (canvas.width = window.innerWidth);
canvas.width = windowWidth;
canvas.height = windowHeight;

context.font = "Press Start 2P";

let bgMusic = new Audio("../sounds/musicDefault.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.1;
bgMusic.play();

let shootSoud = new Audio("../sounds/laserShoot.wav");
shootSoud.volume = 0.2;

let damageSound = new Audio("../sounds/explosion2.wav");
damageSound.volume = 0.2;

let hitSound = new Audio("../sounds/explosion1.wav");
hitSound.volume = 0.05;

const shipSize = { width: 40, height: 40 };
const enemyDefSize = { width: 40, height: 40 };

let shakeTime = 0;
let shakeStrength = 8;

let currentTime = Date.now();

let paused = false;

let bullets = [];

let lastShotTime = 0;
let shotDelay = 300;

let enemies = [];
let lastEnemyReleased = 0;
let releaseEnemyDelay = 2000;

let kills = 0;

let hearts = 3;

let moveUp = false;
let moveDown = false;
let moveRight = false;
let moveLeft = false;

window.addEventListener("keydown", (e) => {
  if (e.key === "r" && hearts == 0) {
    restartGame();
  }

  if (e.key === "p") {
    paused = !paused;
  }

  switch (e.key) {
    case " ":
      shoot();
      break;

    case "a":
    case "ArrowLeft":
      moveLeft = true;
      break;

    case "d":
    case "ArrowRight":
      moveRight = true;
      break;

    case "w":
    case "ArrowUp":
      moveUp = true;
      break;

    case "s":
    case "ArrowDown":
      moveDown = true;
      break;
  }
});
window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "a":
    case "ArrowLeft":
      moveLeft = false;
      break;

    case "d":
    case "ArrowRight":
      moveRight = false;
      break;

    case "w":
    case "ArrowUp":
      moveUp = false;
      break;

    case "s":
    case "ArrowDown":
      moveDown = false;
      break;
  }
});

let life = new Image();
life.src = "../img/util/hearts/fullHeart.png";
life.onload = () => {
  context.drawImage(life, 0, 0, 40, 40);
};

let space = new Image();
space.src = "../img/util/bg/space.png";
space.onload = () => {
  context.drawImage(space, 0, 0, canvas.width, canvas.height);
};

let ship = new Image();
ship.src = "../img/ships/defaultBlue.png";
ship.onload = () => {
  context.drawImage(ship, canvas.width / 2 - 10, 80 - 10, 20, 20);
};

let enemyAsteroid1 = new Image();
enemyAsteroid1.src = "../img/enemies/asteroidGray.png";
enemyAsteroid1.onload = () => {
  context.drawImage(enemyAsteroid1, canvas.width / 2 - 10, 80 - 10, 20, 20);
};

// let enemyAsteroid2 = new Image();
// enemyAsteroid2.src = "../img/enemies/asteroidBrow";
// enemyAsteroid2.onload = () => {
//   context.drawImage(ship, canvas.width / 2 - 10, 80 - 10, 20, 20);
// };

let shipX = canvas.width / 2;
let shipY = canvas.height - 80;

let speed = 5;

let enemy1X = Math.random() * canvas.width;
let enemy1Y = -50;

let enemySpeed = 1;

function shoot() {
  if (currentTime - lastShotTime > shotDelay) {
    bullets.push({
      x: shipX + shipSize.width / 2,
      y: shipY,
    });

    lastShotTime = currentTime;
    shootSoud.play();
  }
}

function releaseEnemy() {
  if (currentTime - lastEnemyReleased > releaseEnemyDelay) {
    enemies.push({
      x: Math.random() * (canvas.width - enemyDefSize.width),
      y: enemy1Y,
      rotation: 0,
    });

    lastEnemyReleased = currentTime;

    if (kills > 10) {
      enemySpeed = enemySpeed + 0.1;
    }
  }
}

function restartGame() {
  enemies = [];
  bullets = [];
  hearts = 3;
  kills = 0;
  enemySpeed = 0.4;

  shipX = canvas.width / 2;
  shipY = canvas.height - 80;
}

function draw() {
  if (
    canvas.width !== window.innerWidth ||
    canvas.height !== window.innerHeight
  ) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  //tela de pause
  if (paused) {
    // escurece a tela
    context.fillStyle = "rgba(0, 0, 0, 0.02)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "white";
    context.font = "bold 60px 'Press Start 2P'";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
    return;
  }
  if (hearts == 0) {
    // escurece a tela
    context.fillStyle = "rgba(56, 18, 18, 0.06)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // texto
    context.fillStyle = "#ff6b6b";
    context.font = "50px 'Press Start 2P'";
    context.fillText("DERROTA", canvas.width / 2, canvas.height / 2);

    context.fillStyle = "white";
    context.font = "16px 'Press Start 2P'";
    context.fillText(
      "KILLS: " + kills,
      canvas.width / 2,
      canvas.height / 2 + 60,
    );

    // texto extra
    context.fillStyle = "#cccccc";
    context.font = "20px 'Press Start 2P'";
    context.fillText(
      "Pressione R para reiniciar",
      canvas.width / 2,
      canvas.height / 2 + 90,
    );
    return;
  }
  if (shakeTime > 0) {
    let dx = (Math.random() - 0.5) * shakeStrength;
    let dy = (Math.random() - 0.5) * shakeStrength;

    context.save();
    context.translate(dx, dy);
  }

  currentTime = Date.now();

  //começa onda de inimigos
  releaseEnemy();

  //padrão de jogo e bg
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(space, 0, 0, canvas.width, canvas.height);

  //número de abates
  context.fillStyle = "#E4D761";
  context.font = "bold 30px 'Press Start 2P'";
  context.textAlign = "center";
  context.fillText(kills, canvas.width - 60, 40);

  //renderiza corações
  for (let i = 0; i < hearts; i++) {
    context.drawImage(life, i * 50, 10, 40, 40);
  }

  //movimentação da nave e limite da tela
  if (moveLeft) {
    shipX -= speed;
  }
  if (moveRight) {
    shipX += speed;
  }
  if (moveUp) {
    shipY -= speed;
  }
  if (moveDown) {
    shipY += speed;
  }
  if (shipX < 0) {
    shipX = 0;
  }
  if (shipY < 0) {
    shipY = 0;
  }
  if (shipX > canvas.width - shipSize.width) {
    shipX = canvas.width - shipSize.width;
  }
  if (shipY > canvas.height - shipSize.height) {
    shipY = canvas.height - shipSize.height;
  }
  context.drawImage(ship, shipX, shipY, shipSize.width, shipSize.height);

  //tiros
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= 10;

    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }

  for (let i = 0; i < bullets.length; i++) {
    context.beginPath();
    context.arc(bullets[i].x, bullets[i].y, 3, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();
  }

  // Colisão
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (
        bullets[i].x > enemies[j].x &&
        bullets[i].x < enemies[j].x + enemyDefSize.width &&
        bullets[i].y > enemies[j].y &&
        bullets[i].y < enemies[j].y + enemyDefSize.height
      ) {
        hitSound.currentTime = 0;
        hitSound.play();
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        kills++;
        break;
      }
    }
  }

  for (let i = 0; i < enemies.length; i++) {
    enemies[i].y += enemySpeed;
  }
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].rotation += 0.02;

    context.save();

    context.translate(
      enemies[i].x + enemyDefSize.width / 2,
      enemies[i].y + enemyDefSize.height / 2,
    );

    context.rotate(enemies[i].rotation);

    context.drawImage(
      enemyAsteroid1,
      -enemyDefSize.width / 2,
      -enemyDefSize.height / 2,
      enemyDefSize.width,
      enemyDefSize.height,
    );

    context.restore();

    if (enemies[i].y > canvas.height) {
      damageSound.currentTime = 0;
      damageSound.play();
      enemies.splice(i, 1);
      hearts--;
      shakeTime = 15;
    }
  }
  if (shakeTime > 0) {
    context.restore();
    shakeTime--;
  }
}

function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
