import { resumeGame, playerState } from "./script.js";
var cardPower = document.getElementById("cardPower");

export const powers = [
  {
    id: "damageUp",
    name: "Dano Aumentado",
    desc: "aumenta o dano dos tiros",
    effect: () => {
      playerState.shotDamage = 0.3;
    },
  },
  {
    id: "rapidFire",
    name: "Fogo Rápido",
    desc: "diminui delay do tiro",
    effect: () => {
      playerState.shotDelay = 300;
    },
  },
  {
    id: "boucingBullets",
    name: "Projétil com Ricochete",
    desc: "tiros ricocheteiam nas paredes e inimigos",
    effect: () => {
      playerState.bouncingBullets = true;
    },
  },
  {
    id: "bombs",
    name: "Bombas",
    desc: "lança bombas que explodem ao atingir inimigos ou o chão",
    effect: () => {
      playerState.bombs = true;
    },
  },
  {
    id: "shield",
    name: "Escudo",
    desc: "bloqueia 1 dano",
    effect: () => {
      playerState.shield++;
    },
  },
  {
    id: "reflectedBullets",
    name: "Balas Refletidas",
    desc: "atira projéteis para os lados",
    effect: () => {
      playerState.reflectedBullets = true;
    },
  },
  {
    id: "speed",
    name: "Aceleração",
    desc: "aumenta a velocidade da nave",
    effect: () => {
      playerState.speed = 5;
    },
  },
  {
    id: "slowPower",
    name: "Desaceleração",
    desc: "desacelera inimigos por um tempo",
    effect: () => {
      playerState.slowPower = true;
    },
  },
  {
    id: "dash",
    name: "Turbo",
    desc: "move-se rapidamente em uma direção",
    effect: () => {
      playerState.dash = true;
    },
  },
];

export function showPowerCards() {
  cardPower.innerHTML = "";

  const randomPower = [...powers].sort(() => 0.5 - Math.random()).slice(0, 3);

  randomPower.forEach((power) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${power.name}</h3>
      <p>${power.desc}</p>
    `;

    card.addEventListener("click", () => {
      powers.splice(
        powers.findIndex((p) => p.id === power.id),
        1,
      );
      power.effect();
      cardPower.style.display = "none";
      resumeGame();
    });

    cardPower.appendChild(card);
  });

  cardPower.style.display = "flex";
}
