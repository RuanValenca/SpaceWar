import { resumeGame } from "./script.js";
var cardPower = document.getElementById("cardPower");

const powers = [
  { id: "doubleShot", name: "DOUBLE SHOT", desc: "atira 2 tiros" },
  { id: "rapidFire", name: "RAPID FIRE", desc: "diminui delay do tiro" },
  { id: "shield", name: "SHIELD", desc: "bloqueia 1 dano" },
  { id: "bigBullet", name: "BIG BULLET", desc: "tiro maior" },
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
      console.log("Poder escolhido:", power.id);
      cardPower.style.display = "none";
      resumeGame();
    });

    cardPower.appendChild(card);
  });

  cardPower.style.display = "flex";
}
