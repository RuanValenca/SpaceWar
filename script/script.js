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

let enemyAsteroid2 = new Image();
enemyAsteroid2.src = "./img/enemies/asteroidBrown.png";

// variáveis do jogo
const shipSize = { width: 40, height: 40 };

let currentTime = Date.now();
let paused = false;

const initialState = {
  player: {
    speed: 3,
    dash: false,
    doubleShot: false,
    shotDamage: 0.2,
    reflectedBullets: false,
    shield: 0,
    shotDelay: 500,
    slowPower: false,
  },
  enemy: {
    enemies: [],
    lastEnemyReleased: 0,
    releaseEnemyDelay: 2000,
    enemySpeed: 0.2,
    life: 1,
    value: 1,
    size: { width: 40, height: 40 },
  },
  enemy2: {
    enemies2: [],
    lastEnemyReleased2: 0,
    releaseEnemyDelay2: 150000,
    enemySpeed: 0.5,
    life: 3,
    damage: 1,
    value: 3,
    size: {
      width: 70,
      height: 70,
    },
  },
};

export const playerState = { ...initialState.player };

export const enemyState = { ...initialState.enemy };

export const enemyState2 = { ...initialState.enemy2 };

let shipX = canvas.width / 2;
let shipY = canvas.height - 80;

let shipRotation = 0;
let targetRotation = 0;

let dashDelay = 1000;
let lastTimeDashed = 0;

let kills = 0;
let killsNextUpgrade = 2;
let killsForUpgrade = 2;
let choosingPower = false;
let hearts = 3;

let moveUp = false;
let moveDown = false;
let moveRight = false;
let moveLeft = false;

let bullets = [];
let lastShotTime = 0;

let shakeTime = 0;
let shakeStrength = 8;

// input
window.addEventListener("keydown", (e) => {
  if (!bgMusic.playing) bgMusic.play().catch(() => {});

  if (e.key === "r" && hearts === 0) restartGame();
  if (e.key === "p") paused = !paused;

  if (playerState.dash == true && e.key == "Shift") {
    if (Date.now() - lastTimeDashed > dashDelay) {
      lastTimeDashed = Date.now();
      playerState.speed = 15;
      setTimeout(() => {
        playerState.speed = 5;
      }, 100);
    }
  }

  switch (e.key) {
    case " ":
      shoot();
      break;
    case "a":
    case "ArrowLeft":
      targetRotation = -0.4;
      moveLeft = true;
      break;
    case "d":
    case "ArrowRight":
      targetRotation = 0.4;
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
      shipRotation = 0;
      targetRotation = 0;

      moveLeft = false;
      break;
    case "d":
    case "ArrowRight":
      shipRotation = 0;
      targetRotation = 0;
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
  if (Date.now() - lastShotTime > playerState.shotDelay) {
    bullets.push({ x: shipX + shipSize.width / 2, y: shipY });
    lastShotTime = Date.now();
    shootSound.play();
  }
}

function releaseEnemy() {
  if (
    Date.now() - enemyState.lastEnemyReleased >
    enemyState.releaseEnemyDelay
  ) {
    enemyState.enemies.push({
      x: Math.random() * (canvas.width - initialState.enemy.size.width),
      y: -50,
      rotation: 0,
      life: initialState.enemy.life,
      damage: 1,
      speed: initialState.enemy.enemySpeed,
      size: initialState.enemy.size,
      sprite: enemyAsteroid1,
    });

    enemyState.lastEnemyReleased = Date.now();
  }

  if (
    kills > 10 &&
    Date.now() - enemyState2.lastEnemyReleased2 > enemyState2.releaseEnemyDelay2
  ) {
    enemyState.enemies.push({
      x: Math.random() * (canvas.width - initialState.enemy2.size.width),
      y: -50,
      rotation: 0,
      life: initialState.enemy2.life,
      damage: initialState.enemy2.damage,
      speed: initialState.enemy2.enemySpeed,
      size: initialState.enemy2.size,
      sprite: enemyAsteroid2,
    });

    enemyState2.lastEnemyReleased2 = Date.now();
  }
}

function restartGame() {
  Object.assign(playerState, initialState.player);
  Object.assign(enemyState, initialState.enemy);
  Object.assign(enemyState2, initialState.enemy2);
  bullets = [];

  hearts = 3;
  kills = 0;

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
      "Clique em R para reiniciar",
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
  if (moveLeft) {
    shipX -= playerState.speed;
  }

  if (moveRight) {
    shipX += playerState.speed;
  }

  if (moveUp) {
    shipY -= playerState.speed;
    shipRotation = 0;
  }
  if (moveDown) {
    shipY += playerState.speed;
    shipRotation = 0;
  }

  shipRotation += (targetRotation - shipRotation) * 0.2;

  // limites da nave
  shipX = Math.max(0, Math.min(shipX, canvas.width - shipSize.width));
  shipY = Math.max(0, Math.min(shipY, canvas.height - shipSize.height));

  context.save();

  context.translate(shipX + shipSize.width / 2, shipY + shipSize.height / 2);

  context.rotate(shipRotation);

  context.drawImage(
    ship,
    -shipSize.width / 2,
    -shipSize.height / 2,
    shipSize.width,
    shipSize.height,
  );

  context.restore();

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
    for (let j = enemyState.enemies.length - 1; j >= 0; j--) {
      let e = enemyState.enemies[j];

      if (
        bullets[i].x > e.x &&
        bullets[i].x < e.x + e.size.width &&
        bullets[i].y > e.y &&
        bullets[i].y < e.y + e.size.height
      ) {
        hitSound.currentTime = 0;
        hitSound.play();

        e.life -= playerState.shotDamage;

        bullets.splice(i, 1);

        if (e.life <= 0) {
          enemyState.enemies.splice(j, 1);
          kills++;
        }

        break;
      }
    }
  }

  // inimigos
  enemyState.enemies.forEach((e, i) => {
    e.y += e.speed;
    e.rotation += 0.01;

    context.save();

    context.translate(e.x + e.size.width / 2, e.y + e.size.height / 2);

    context.rotate(e.rotation);

    context.drawImage(
      e.sprite,
      -e.size.width / 2,
      -e.size.height / 2,
      e.size.width,
      e.size.height,
    );

    context.restore();

    // colisão com fundo
    if (e.y > canvas.height) {
      damageSound.currentTime = 0;
      damageSound.play();

      enemyState.enemies.splice(i, 1);

      hearts -= e.damage;

      if (hearts > 0) {
        shakeTime = 15;
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
