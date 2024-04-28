window.onload = () => {
  document.getElementById("start").addEventListener("click", () => {
    socket.emit("joinroom");
    init();
  });
};

function Game() {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  update();
  draw();

  function updateStatesonServer() {
    socket.emit("playerstates", {
      allCells: PLAYER.allCells,
      color: PLAYER.color,
      id: socket.id,
      angle: PLAYER.angle,
    });
  }
  updateStatesonServer();

  // adjust marigns
  var cx = PLAYER.allCells[0].row;
  var cy = PLAYER.allCells[0].col;
  CANVAS.style.top = window.innerHeight / 2 - cy + "px";
  CANVAS.style.left = window.innerWidth / 2 - cx + "px";
}

function CreatePlayer() {
  PLAYER = new Snake();
  const terminalcoord = {
    row: Math.floor(Math.random() * MAPWIDTH - 100) + 100,
    col: Math.floor(Math.random() * MAPHEIGHT - 100) + 100,
  };
  for (var i = 0; i < 10; i++) {
    const cell = new Cell(
      terminalcoord.row,
      terminalcoord.col + (Snake.baseRadius * 2 - Snake.baseRadius / 2) * i
    );
    PLAYER.allCells.push(cell);
  }
}

function update() {
  PLAYER.update();

  // check collision
  var flag = false;
  for (var key of Object.keys(ALLENEMY)) {
    const arr = ALLENEMY[key].allCells;
    if (!arr) continue;
    for (var cell of arr) {
      var diff = Math.abs(
        Math.hypot(
          cell.row - PLAYER.allCells[0].row,
          cell.col - PLAYER.allCells[0].col
        )
      );
      if (diff <= Snake.baseRadius * 2) {
        flag = true;
        break;
      }
    }
    if (flag) {
      const body = document.querySelector("body");
      socket.emit("death");
      const panel = `
      <div class="end">
      <h1>Game end</h1>
      <button
        style="
          cursor: pointer;
          padding: 10px;
          width: 150px;
          border: none;
          outline: none;
          background-color: #ff1d58;
          border-radius: 5px;
        "
        onclick="window.location.reload();"
      >
        play again
      </button>
    </div>`;
      body.innerHTML = panel;
    }
  }

  const head = PLAYER.allCells[0];
  const eat = [];
  for (var f of ALLFOOD) {
    const diff = Math.hypot(
      Math.abs(f.row - head.row),
      Math.abs(f.col - head.col)
    );

    if (diff <= 10 + Snake.baseRadius) {
      eat.push(f);
      PLAYER.mass = PLAYER.mass + 30;
    }
  }
  if (eat.length > 0) {
    socket.emit("eatfood", eat);
  }
}
function draw() {
  PLAYER.draw();
  // draw enemy
  for (var key of Object.keys(ALLENEMY)) {
    const c = ALLENEMY[key].color;
    const arr = ALLENEMY[key].allCells;
    if (!arr) continue;
    for (var cell of arr) {
      CONTEXT.beginPath();
      CONTEXT.fillStyle = c;
      CONTEXT.arc(cell.row, cell.col, Snake.baseRadius, 0, 2 * Math.PI);
      CONTEXT.fill();
      CONTEXT.closePath();
    }
    // helper
    function drawEye() {
      CONTEXT.beginPath();
      CONTEXT.fillStyle = "black";
      CONTEXT.arc(
        arr[0].row + Math.sin(ALLENEMY[key].angle + Math.PI / 4) * 10,
        arr[0].col + Math.cos(ALLENEMY[key].angle + Math.PI / 4) * 10,
        5,
        0,
        2 * Math.PI
      );
      CONTEXT.fill();
      CONTEXT.closePath();
      CONTEXT.beginPath();
      CONTEXT.fillStyle = "black";
      CONTEXT.arc(
        arr[0].row + Math.sin(ALLENEMY[key].angle - Math.PI / 4) * 10,
        arr[0].col + Math.cos(ALLENEMY[key].angle - Math.PI / 4) * 10,
        5,
        0,
        2 * Math.PI
      );
      CONTEXT.fill();
      CONTEXT.closePath();
    }
    drawEye();
  }

  for (var f of ALLFOOD) {
    CONTEXT.beginPath();
    CONTEXT.fillStyle = f.color;
    CONTEXT.arc(f.row, f.col, 10, 0, 2 * Math.PI);
    CONTEXT.fill();
    CONTEXT.closePath();
  }
}

function init() {
  document.querySelector("body").innerHTML = `<canvas id="canvas"></canvas>`;
  CANVAS = document.getElementById("canvas");
  CONTEXT = CANVAS.getContext("2d");
  CANVAS.width = MAPWIDTH;
  CANVAS.height = MAPHEIGHT;
  CANVAS.style.border = "3px solid #fff";
  CANVAS.style.top = window.innerHeight / 2 + "px";
  CANVAS.style.left = window.innerWidth / 2 + "px";

  CreatePlayer();
  document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowLeft") {
      PLAYER.turn_ = "left";
    }
    if (key == "ArrowRight") {
      PLAYER.turn_ = "right";
    }
    if (key == "ArrowUp") {
      PLAYER.accelerate = true;
    }
  });
  document.addEventListener("keyup", ({ key }) => {
    if (key == "ArrowUp") {
      PLAYER.accelerate = false;
    }
    if (key == "ArrowLeft" || key == "ArrowRight") {
      PLAYER.turn_ = null;
    }
  });

  setInterval(() => {
    Game();
  }, 1000 / fps);
}

socket.on("reciveenemy", (arr) => {
  for (var id of arr) {
    if (socket.id == id) continue;
    if (!ALLENEMY[id]) {
      ALLENEMY[id] = {};
    }
  }
});
socket.on("enemystate", ({ allCells, color, id, angle }) => {
  if (!ALLENEMY[id]) return;

  ALLENEMY[id] = { allCells, color, angle };
});
socket.on("death", (id) => {
  delete ALLENEMY[id];
});
socket.on("foods", (foods) => {
  ALLFOOD = foods;
});
socket.on("updatefood", (foods) => {
  ALLFOOD = foods;
});
