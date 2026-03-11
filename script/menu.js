export let gameStarted = false;

const startButton = document.getElementById("startButton");

export function setupMenu() {
  startButton.addEventListener("click", () => {
    gameStarted = true;
    startButton.style.display = "none";
  });
}

let bgMenu = new Image();
bgMenu.src = "./img/util/bg/bgMenu.png";

// desenhar o menu
export function drawMenu(context, canvas) {
  context.drawImage(bgMenu, 0, 0, canvas.width, canvas.height);

  context.fillStyle = "#000000A8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "white";
  context.font = "48px 'Press Start 2P'";
  context.textAlign = "center";
  context.strokeStyle = "aqua";
  context.lineWidth = 1;
  context.strokeText("SPACE WAR", canvas.width / 2, canvas.height / 3);
  context.fillText("SPACE WAR", canvas.width / 2, canvas.height / 3);
}
