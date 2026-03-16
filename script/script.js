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

let bullet = new Image();
bullet.src = "./img/util/effects/bullet.png";

let bomb = new Image();
bomb.src = "./img/util/effects/fireball.png";

let life = new Image();
life.src = "./img/util/hearts/fullHeart.png";

let shield = new Image();
shield.src = "./img/util/hearts/shield (2).png";

let laserBeam = new Image();
laserBeam.src = "./img/util/effects/laserBeam.png";

let enemyAsteroid1 = new Image();
enemyAsteroid1.src = "./img/enemies/asteroidGray.png";

let enemyAsteroid2 = new Image();
enemyAsteroid2.src = "./img/enemies/asteroidBrown.png";

// variáveis do jogo
const shipSize = { width: 40, height: 40 };

let currentTime = Date.now();
let lastFrameTime = Date.now();
let paused = false;

const initialState = {
  player: {
    speed: 3,
    dash: false,
    doubleShot: false,
    shotDamage: 0.3,
    scatterShot: false,
    shield: 0,
    shotDelay: 500,
    slowPower: false,
    bombs: false,
    laser: false,
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
    releaseEnemyDelay2: 25000,
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

export let playerState = { ...initialState.player };

export let enemyState = { ...initialState.enemy };

export let enemyState2 = { ...initialState.enemy2 };

let shipX = canvas.width / 2;
let shipY = canvas.height - 80;

let shipCenter = shipX + shipSize.width / 2;

let shipRotation = 0;
let targetRotation = 0;

let dashDelay = 1000;
let lastTimeDashed = 0;

let kills = 0;
let killsNextUpgrade = 2;
let killsForUpgrade = 2;
let choosingPower = false;
let hearts = 3;

let lastBombTime = 0;
let bombDelay = 15000;
let bombs = [];
let bombRadius = 100;
let bombDamage = 2;

let lastSlowPowerTime = 0;
let slowPowerDelay = 25000;
let slowPowerDuration = 4000;
let slowActive = false;

let lasers = [];
let laserDamage = 1;
let lastLaserTime = 0;
let laserDelay = 15000;
let laserTimeDuration = 1500;

let moveUp = false;
let moveDown = false;
let moveRight = false;
let moveLeft = false;

let barWidth = 120;
let progressDisplay = 0;
let barHeight = 14;
let barX = canvas.width - 220;
let barY = 15;

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
      playerState.speed *= 5;
      setTimeout(() => {
        playerState.speed /= 5;
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
    bullets.push({ x: shipCenter, y: shipY });
    lastShotTime = Date.now();
    shootSound.play();
  }
}

function shootLaser() {
  if (Date.now() - lastLaserTime > laserDelay) {
    let target = enemyState.enemies[0];

    lasers.push({
      x: shipCenter,
      y: shipY,
      target: target,
      targetX: target ? target.x + target.size.width / 2 : shipCenter,
      targetY: target ? target.y + target.size.height / 2 : shipY,
    });

    setTimeout(() => {
      lasers.splice(0, 1);
    }, laserTimeDuration);

    lastLaserTime = Date.now();
  }
}

function spawnBomb() {
  if (Date.now() - lastBombTime > bombDelay) {
    bombs.push({
      x: shipCenter,
      y: shipY,
      targetX: Math.random() * (canvas.width - 100) + 50,
      targetY: Math.random() * (canvas.height * 0.25),
      placed: false,
    });

    lastBombTime = Date.now();
  }
}

function slowPower() {
  if (!slowActive && Date.now() - lastSlowPowerTime > slowPowerDelay) {
    slowActive = true;
    lastSlowPowerTime = Date.now();

    enemyState.enemies.forEach((e) => {
      e.originalSpeed = e.speed;
      e.speed *= 0.4;
    });

    setTimeout(() => {
      enemyState.enemies.forEach((e) => {
        if (e.sprite === enemyAsteroid1) {
          e.speed = initialState.enemy.enemySpeed;
        } else {
          e.speed = initialState.enemy2.enemySpeed;
        }
      });

      slowActive = false;
    }, slowPowerDuration);
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
      hitTime: 0,
      dead: false,
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
      hitTime: 0,
      dead: false,
    });

    enemyState2.lastEnemyReleased2 = Date.now();
  }
}

function restartGame() {
  playerState = { ...initialState.player };
  enemyState = { ...initialState.enemy };
  enemyState2 = { ...initialState.enemy2 };

  enemyState.enemies = [];
  enemyState2.enemies2 = [];

  bullets = [];
  bombs = [];
  lasers = [];

  hearts = 3;
  kills = 0;

  shipX = canvas.width / 2;
  shipY = canvas.height - 80;

  killsNextUpgrade = 2;
  killsForUpgrade = 2;

  lastShotTime = 0;
  lastBombTime = 0;
  lastLaserTime = 0;
  lastSlowPowerTime = 0;
  lastTimeDashed = 0;

  choosingPower = false;
  paused = false;
  slowActive = false;
}

function drawGame() {
  let now = Date.now();
  let deltaTime = (now - lastFrameTime) / 1000; // em segundos
  lastFrameTime = now;

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

  let progress = kills / killsNextUpgrade;
  progress = Math.min(progress, 1);

  // animação suave
  progressDisplay += (progress - progressDisplay) * 0.1;

  // kills
  context.save();

  context.fillStyle = "#E4D761";
  context.font = "bold 30px 'Press Start 2P'";
  context.textAlign = "center";
  context.fillText(kills, canvas.width - 60, 40);

  context.restore();

  // barra de progresso
  context.fillStyle = "rgba(255,255,255,0.15)";
  context.fillRect(barX, barY, barWidth, barHeight);

  // progresso da barra
  context.save();

  context.shadowColor = "#61DBE4";
  context.shadowBlur = 10;

  context.fillStyle = "#617FE4";
  context.fillRect(barX, barY, barWidth * progressDisplay, barHeight);

  context.restore();

  context.strokeStyle = "white";
  context.lineWidth = 2;
  context.strokeRect(barX, barY, barWidth, barHeight);

  context.fillStyle = "white";
  context.font = "10px 'Press Start 2P'";
  context.textAlign = "center";
  context.fillText(
    Math.floor(progress * 100) + "%",
    barX + barWidth / 2,
    barY + 14,
  );

  // corações
  for (let i = 0; i < hearts; i++) {
    context.drawImage(life, 20 + i * 50, 10, 40, 40);
  }

  for (let i = 0; i < playerState.shield; i++) {
    context.drawImage(life, 20 + i * 50, 10, 40, 40);
  }

  // movimentação da nave

  shipCenter = shipX + shipSize.width / 2;

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

  context.translate(shipCenter, shipY + shipSize.height / 2);

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
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x += b.vx || 0;
    b.y += b.vy || -10;

    context.save();

    context.translate(b.x, b.y);

    context.rotate(b.angle || 0);

    context.drawImage(bullet, -10, -25, 20, 50);

    context.restore();

    if (b.y < 0) bullets.splice(i, 1);
  }

  //desaceleração dos inimigos
  if (playerState.slowPower) {
    slowPower();
  }

  // criar bomba
  if (playerState.bombs) {
    spawnBomb();
  }

  bombs.forEach((b, i) => {
    if (!b.placed) {
      let dx = b.targetX - b.x;
      let dy = b.targetY - b.y;

      let dist = Math.sqrt(dx * dx + dy * dy);

      b.x += (dx / dist) * 3;
      b.y += (dy / dist) * 3;

      if (dist < 5) {
        b.placed = true;
      }
    }

    context.drawImage(bomb, b.x - 20, b.y - 20, 40, 40);
  });

  // criar laser
  if (playerState.laser) {
    shootLaser();
  }

  lasers.forEach((l, i) => {
    let dx = l.targetX - l.x;
    let dy = l.targetY - l.y;

    let dist = Math.sqrt(dx * dx + dy * dy);

    l.x += (dx / dist) * 3;
    l.y += (dy / dist) * 3;

    if (dist > 0) {
      l.x += (dx / dist) * 3;
      l.y += (dy / dist) * 3;
    }

    if (l.target) {
      l.targetX = l.target.x + l.target.size.width / 2;
      l.targetY = l.target.y + l.target.size.height / 2;
    }

    // brilho externo
    context.beginPath();
    context.moveTo(shipCenter, shipY + shipSize.height / 2);
    context.lineTo(l.targetX, l.targetY);
    context.strokeStyle = "rgba(0,255,255,0.4)";
    context.lineWidth = 10;
    context.stroke();

    // linha principal
    context.beginPath();
    context.moveTo(shipCenter, shipY + shipSize.height / 2);
    context.lineTo(l.targetX, l.targetY);
    context.strokeStyle = "#00ffff";
    context.lineWidth = 3;
    context.stroke();
  });

  // colisões
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemyState.enemies.length - 1; j >= 0; j--) {
      if (bullets[i].ignoreEnemy === j) continue;

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
        e.hitTime = Date.now();

        if (playerState.scatterShot && !bullets[i].reflected) {
          bullets.push({
            x: bullets[i].x,
            y: bullets[i].y,
            vx: -4,
            vy: -8,
            angle: -0.5,
            reflected: true,
            ignoreEnemy: j,
          });

          bullets.push({
            x: bullets[i].x,
            y: bullets[i].y,
            vx: 4,
            vy: -8,
            angle: 0.5,
            reflected: true,
            ignoreEnemy: j,
          });
        }

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
  bombs.forEach((b, bi) => {
    enemyState.enemies.forEach((e, ei) => {
      // colisão direta com a bomba
      if (
        b.x > e.x &&
        b.x < e.x + e.size.width &&
        b.y > e.y &&
        b.y < e.y + e.size.height
      ) {
        // explosão em área
        for (let i = enemyState.enemies.length - 1; i >= 0; i--) {
          let enemy = enemyState.enemies[i];
          let index = i;
          let ex = enemy.x + enemy.size.width / 2;
          let ey = enemy.y + enemy.size.height / 2;

          let dist = Math.hypot(ex - b.x, ey - b.y);

          if (dist < bombRadius) {
            enemy.life -= bombDamage;

            if (enemy.life <= 0) {
              enemyState.enemies.splice(index, 1);
              kills++;
            }
          }
        }

        // remover bomba
        bombs.splice(bi, 1);
      }
    });
  });

  lasers.forEach((l, li) => {
    let e = l.target;

    if (!e || e.dead) return;

    e.life -= laserDamage * deltaTime;

    if (e.life <= 0) {
      e.dead = true;
      kills++;
      lasers.splice(li, 1);

      let index = enemyState.enemies.indexOf(e);
      if (index !== -1) enemyState.enemies.splice(index, 1);
    }
  });

  enemyState.enemies.forEach((e, i) => {
    e.y += e.speed;
    e.rotation += 0.01;

    context.save();

    context.translate(e.x + e.size.width / 2, e.y + e.size.height / 2);

    context.rotate(e.rotation);

    context.filter = "none";

    if (slowActive) {
      context.filter = "sepia(1) hue-rotate(180deg) saturate(3)";
    }

    if (Date.now() - e.hitTime < 30) {
      context.filter = "brightness(3)";
    }

    context.drawImage(
      e.sprite,
      -e.size.width / 2,
      -e.size.height / 2,
      e.size.width,
      e.size.height,
    );

    context.filter = "none";

    context.restore();

    // colisão com fundo

    if (e.y > canvas.height) {
      damageSound.currentTime = 0;
      damageSound.play();

      enemyState.enemies.splice(i, 1);

      if (playerState.shield > 0) {
        playerState.shield -= e.damage;
      } else {
        hearts -= e.damage;
      }

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
