class Snake {
  static baseRadius = 20;
  static baseSpeed = 4;
  static acceleratedSpeed = 8;
  constructor() {
    this.allCells = [];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.radius = Snake.baseRadius;
    this.angle = 0; // radiaj
    this.turn_ = null;
    this.accelerate = false;
    this.mass = 10 * 100; // base mass
  }
  draw() {
    for (var cell of this.allCells) {
      CONTEXT.beginPath();
      CONTEXT.fillStyle = this.color;
      CONTEXT.arc(cell.row, cell.col, this.radius, 0, 2 * Math.PI);
      CONTEXT.fill();
      CONTEXT.closePath();

      this.drawEye();
    }
  }
  move() {
    for (var i = this.allCells.length - 2; i >= 0; i--) {
      const c1 = this.allCells[i];
      const c2 = this.allCells[i + 1];

      c2.row =
        c1.row -
        (Math.sin(this.angle) * this.radius * 2 -
          (Math.sin(this.angle) * this.radius) / 0.7);
      c2.col =
        c1.col -
        (Math.cos(this.angle) * this.radius * 2 -
          (Math.cos(this.angle) * this.radius) / 0.7);
    }
    // move head
    const speed = this.accelerate ? Snake.acceleratedSpeed : Snake.baseSpeed;
    const diffrow = Math.sin(this.angle) * speed;
    const diffcol = Math.cos(this.angle) * speed;

    this.allCells[0].row += diffrow;
    this.allCells[0].col += diffcol;
    if (
      this.allCells[0].col >= MAPHEIGHT ||
      this.allCells[0].col <= 0 ||
      this.allCells[0].row <= 0 ||
      this.allCells[0].row >= MAPWIDTH
    ) {
      this.allCells[0].row -= diffrow;
      this.allCells[0].col -= diffcol;
    }
  }
  update() {
    this.move();
    if (this.turn_ != null) this.turn(this.turn_);
    if (this.accelerate && this.mass > 300) {
      this.mass -= 1;
    }
    if (Math.ceil(this.mass / 100) < this.allCells.length) {
      this.allCells.pop();
    }
    if (Math.ceil(this.mass / 100) > this.allCells.length + 1) {
      // add new cell
      const speed = this.accelerate ? Snake.acceleratedSpeed : Snake.baseSpeed;
      const head = this.allCells[0];
      const diffrow = Math.sin(this.angle) * speed;
      const diffcol = Math.cos(this.angle) * speed;
      const newHead = new Cell(head.row + diffrow, head.col + diffcol);
      if (this.allCells.length <= 50) this.allCells.unshift(newHead);
    }
  }
  turn(direction) {
    if (direction == "left") {
      this.angle += (((300 * 1.5) / fps) * Math.PI) / 180;
    } else {
      this.angle -= (((300 * 1.5) / fps) * Math.PI) / 180;
    }
  }
  drawEye() {
    CONTEXT.beginPath();
    CONTEXT.fillStyle = "black";
    CONTEXT.arc(
      this.allCells[0].row + Math.sin(this.angle + Math.PI / 4) * 10,
      this.allCells[0].col + Math.cos(this.angle + Math.PI / 4) * 10,
      5,
      0,
      2 * Math.PI
    );
    CONTEXT.fill();
    CONTEXT.closePath();
    CONTEXT.beginPath();
    CONTEXT.fillStyle = "black";
    CONTEXT.arc(
      this.allCells[0].row + Math.sin(this.angle - Math.PI / 4) * 10,
      this.allCells[0].col + Math.cos(this.angle - Math.PI / 4) * 10,
      5,
      0,
      2 * Math.PI
    );
    CONTEXT.fill();
    CONTEXT.closePath();
  }
}
