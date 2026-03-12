import { drawMenu, setupMenu, gameStarted } from "./menu.js";
import { showPowerCards } from "./power.js";

// canvas
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let sfx = document.getElementById("sfxBtn");
let audio = document.getElementById("musicBtn");
// setup do menu
setupMenu();

// sons
let bgMusic = new Audio("./sounds/musicDefault.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.1;

let shootSound = new Audio("./sounds/laserShoot.wav");
shootSound.volume = 0.2;

let damageSound = new Audio("./sounds/explosion2.wav");
damageSound.volume = 0.2;

let hitSound = new Audio("./sounds/explosion1.wav");
hitSound.volume = 0.05;

// imagens
let space = new Image();
space.src = "./img/util/bg/space.png";

let ship = new Image();
ship.src = "./img/ships/defaultBlue.png";

let life = new Image();
life.src = "./img/util/hearts/fullHeart.png";

let enemyAsteroid1 = new Image();
enemyAsteroid1.src = "./img/enemies/asteroidGray.png";

// variáveis do jogo
const shipSize = { width: 40, height: 40 };
const enemyDefSize = { width: 40, height: 40 };

let shipX = canvas.width / 2;
let shipY = canvas.height - 80;
let speed = 5;

let bullets = [];
let lastShotTime = 0;
let shotDelay = 300;

let enemies = [];
let lastEnemyReleased = 0;
let releaseEnemyDelay = 2000;
let enemySpeed = 1;

let kills = 0;
let killsNextUpgrade = 2;
let killsForUpgrade = 2;
let choosingPower = false;
let hearts = 3;

let moveUp = false;
let moveDown = false;
let moveRight = false;
let moveLeft = false;

let shakeTime = 0;
let shakeStrength = 8;

let currentTime = Date.now();

let paused = false;

// input
window.addEventListener("keydown", (e) => {
  if (!bgMusic.playing) bgMusic.play().catch(() => {});

  if (e.key === "r" && hearts === 0) restartGame();
  if (e.key === "p") paused = !paused;

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

sfx.addEventListener("click", () => {
  if (shootSound.muted) {
    shootSound.muted = false;
    damageSound.muted = false;
    hitSound.muted = false;
    sfx.textContent = "🔊";
  } else {
    shootSound.muted = true;
    damageSound.muted = true;
    hitSound.muted = true;
    sfx.textContent = "🔇";
  }
});

audio.addEventListener("click", () => {
  if (bgMusic.muted) {
    bgMusic.muted = false;
    audio.textContent = "🎵";
  } else {
    bgMusic.muted = true;
    audio.textContent = "🔇";
  }
});

// funções do jogo
function shoot() {
  if (Date.now() - lastShotTime > shotDelay) {
    bullets.push({ x: shipX + shipSize.width / 2, y: shipY });
    lastShotTime = Date.now();
    shootSound.play();
  }
}

function releaseEnemy() {
  if (Date.now() - lastEnemyReleased > releaseEnemyDelay) {
    enemies.push({
      x: Math.random() * (canvas.width - enemyDefSize.width),
      y: -50,
      rotation: 0,
    });
    lastEnemyReleased = Date.now();
    if (kills > 10) enemySpeed += 0.1;
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
  killsNextUpgrade = 2;
  killsForUpgrade = 2;
}

function drawGame() {
  if (
    canvas.width !== window.innerWidth ||
    canvas.height !== window.innerHeight
  ) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  if (paused) {
    context.fillStyle = "rgba(29, 29, 29, 0.02)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "white";
    context.font = "bold 60px 'Press Start 2P'";
    context.textAlign = "center";
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);

    audio.style.display = "initial";
    sfx.style.display = "initial";
    return;
  } else {
    audio.style.display = "none";
    sfx.style.display = "none";
  }

  if (choosingPower) {
    return;
  }

  if (hearts === 0) {
    context.fillStyle = "rgba(56,18,18,0.06)";
    context.fillRect(0, 0, canvas.width, canvas.height);
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
    context.fillStyle = "#cccccc";
    context.font = "20px 'Press Start 2P'";
    context.fillText(
      "Clique em START para reiniciar",
      canvas.width / 2,
      canvas.height / 2 + 90,
    );
    return;
  }

  // limpar fundo
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(space, 0, 0, canvas.width, canvas.height);

  // aplicar shake apenas se houver vida e jogo ativo
  if (hearts > 0 && shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeStrength;
    const dy = (Math.random() - 0.5) * shakeStrength;
    context.save();
    context.translate(dx, dy);
  }

  // kills
  context.fillStyle = "#E4D761";
  context.font = "bold 30px 'Press Start 2P'";
  context.textAlign = "center";
  context.fillText(kills, canvas.width - 60, 40);

  // corações
  for (let i = 0; i < hearts; i++) {
    context.drawImage(life, i * 50, 10, 40, 40);
  }

  // movimentação da nave
  if (moveLeft) shipX -= speed;
  if (moveRight) shipX += speed;
  if (moveUp) shipY -= speed;
  if (moveDown) shipY += speed;

  // limites da nave
  shipX = Math.max(0, Math.min(shipX, canvas.width - shipSize.width));
  shipY = Math.max(0, Math.min(shipY, canvas.height - shipSize.height));

  context.drawImage(ship, shipX, shipY, shipSize.width, shipSize.height);

  // tiros
  bullets.forEach((b, i) => {
    b.y -= 10;
    context.beginPath();
    context.arc(b.x, b.y, 3, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();

    if (b.y < 0) bullets.splice(i, 1);
  });

  // colisões
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

  // inimigos
  enemies.forEach((e, i) => {
    e.y += enemySpeed;
    e.rotation += 0.02;

    context.save();
    context.translate(
      e.x + enemyDefSize.width / 2,
      e.y + enemyDefSize.height / 2,
    );
    context.rotate(e.rotation);
    context.drawImage(
      enemyAsteroid1,
      -enemyDefSize.width / 2,
      -enemyDefSize.height / 2,
      enemyDefSize.width,
      enemyDefSize.height,
    );
    context.restore();

    // colisão com o fundo da tela
    if (e.y > canvas.height) {
      damageSound.currentTime = 0;
      damageSound.play();
      enemies.splice(i, 1);
      hearts--;
      if (hearts > 0) {
        shakeTime = 15; // shake só enquanto ainda tem vida
      }
    }
  });

  // restaurar shake se aplicado
  if (hearts > 0 && shakeTime > 0) {
    context.restore();
    shakeTime--;
  }

  if (kills >= killsNextUpgrade && !choosingPower) {
    choosingPower = true;
    showPowerCards();
  }

  // lançar novos inimigos
  currentTime = Date.now();
  releaseEnemy();
}

// loop principal
function gameLoop() {
  if (!gameStarted) {
    drawMenu(context, canvas);
  } else {
    drawGame();
    if (bgMusic.paused) bgMusic.play().catch(() => {});
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();

export function resumeGame() {
  choosingPower = false;

  killsForUpgrade *= 2;
  killsNextUpgrade += killsForUpgrade;
}
