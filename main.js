"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

const W = canvas.width;
const H = canvas.height;

// --- ゲーム設定 ---
const paddle = {
  w: 90,
  h: 12,
  x: W / 2 - 45,
  y: H - 30,
  speed: 7,
};

const ball = {
  r: 8,
  x: W / 2,
  y: H - 45,
  dx: 4,
  dy: -4,
};

const brick = {
  rows: 5,
  cols: 8,
  w: 52,
  h: 20,
  padding: 6,
  offsetTop: 50,
  offsetLeft: 12,
};

const COLORS = ["#e94560", "#f0a500", "#4ecca3", "#3fa7d6", "#a06cd5"];

let bricks = [];
let score = 0;
let lives = 3;
let state = "start"; // "start" | "playing" | "gameover" | "win"

// 入力状態
let leftPressed = false;
let rightPressed = false;

function buildBricks() {
  bricks = [];
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.cols; c++) {
      bricks.push({
        x: brick.offsetLeft + c * (brick.w + brick.padding),
        y: brick.offsetTop + r * (brick.h + brick.padding),
        alive: true,
        color: COLORS[r % COLORS.length],
      });
    }
  }
}

function resetBall() {
  ball.x = W / 2;
  ball.y = H - 45;
  ball.dx = 4 * (Math.random() < 0.5 ? 1 : -1);
  ball.dy = -4;
}

function resetGame() {
  score = 0;
  lives = 3;
  paddle.x = W / 2 - paddle.w / 2;
  buildBricks();
  resetBall();
  updateHud();
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

// --- 描画 ---
function drawPaddle() {
  ctx.fillStyle = "#eeeeee";
  roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
  ctx.fill();
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#ff0000";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    roundRect(b.x, b.y, brick.w, brick.h, 4);
    ctx.fill();
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawMessage(lines) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#eee";
  ctx.textAlign = "center";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(lines[0], W / 2, H / 2 - 10);
  if (lines[1]) {
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#bbb";
    ctx.fillText(lines[1], W / 2, H / 2 + 24);
  }
  ctx.textAlign = "start";
}

// --- 更新 ---
function update() {
  // パドル移動
  if (leftPressed) paddle.x -= paddle.speed;
  if (rightPressed) paddle.x += paddle.speed;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  // ボール移動
  ball.x += ball.dx;
  ball.y += ball.dy;

  // 壁反射
  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.dx = -ball.dx;
  } else if (ball.x + ball.r > W) {
    ball.x = W - ball.r;
    ball.dx = -ball.dx;
  }
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.dy = -ball.dy;
  }

  // 床に落下
  if (ball.y - ball.r > H) {
    lives--;
    updateHud();
    if (lives <= 0) {
      state = "gameover";
    } else {
      resetBall();
      paddle.x = W / 2 - paddle.w / 2;
    }
    return;
  }

  // パドル衝突
  if (
    ball.dy > 0 &&
    ball.y + ball.r >= paddle.y &&
    ball.y + ball.r <= paddle.y + paddle.h + Math.abs(ball.dy) &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w
  ) {
    ball.y = paddle.y - ball.r;
    // 当たった位置に応じて反射角を変える
    const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const speed = Math.hypot(ball.dx, ball.dy);
    const angle = hit * (Math.PI / 3); // 最大60度
    ball.dx = speed * Math.sin(angle);
    ball.dy = -speed * Math.cos(angle);
  }

  // ブロック衝突（円と矩形の最近接点で厳格に判定）
  for (const b of bricks) {
    if (!b.alive) continue;

    // 矩形内でボール中心に最も近い点を求める
    const nearestX = Math.max(b.x, Math.min(ball.x, b.x + brick.w));
    const nearestY = Math.max(b.y, Math.min(ball.y, b.y + brick.h));
    const distX = ball.x - nearestX;
    const distY = ball.y - nearestY;
    const dist2 = distX * distX + distY * distY;

    // 最近接点までの距離が半径未満のときだけ衝突とみなす
    if (dist2 > ball.r * ball.r) continue;

    b.alive = false;
    score += 10;
    updateHud();

    if (distX === 0 && distY === 0) {
      // 中心が矩形内（貫通気味）: 侵入量の小さい軸で反射・押し戻し
      const overlapLeft = ball.x - b.x;
      const overlapRight = b.x + brick.w - ball.x;
      const overlapTop = ball.y - b.y;
      const overlapBottom = b.y + brick.h - ball.y;
      const minX = Math.min(overlapLeft, overlapRight);
      const minY = Math.min(overlapTop, overlapBottom);
      if (minX < minY) {
        ball.dx = -ball.dx;
        ball.x += overlapLeft < overlapRight ? -(minX + ball.r) : minX + ball.r;
      } else {
        ball.dy = -ball.dy;
        ball.y += overlapTop < overlapBottom ? -(minY + ball.r) : minY + ball.r;
      }
    } else {
      // 最近接点の法線方向へ反射し、円が矩形から離れるよう押し戻す
      const dist = Math.sqrt(dist2) || 1;
      const nx = distX / dist;
      const ny = distY / dist;
      const dot = ball.dx * nx + ball.dy * ny;
      ball.dx -= 2 * dot * nx;
      ball.dy -= 2 * dot * ny;
      const push = ball.r - dist;
      ball.x += nx * push;
      ball.y += ny * push;
    }
    break;
  }

  // 勝利判定
  if (bricks.every((b) => !b.alive)) {
    state = "win";
  }
}

// --- メインループ ---
function loop() {
  ctx.clearRect(0, 0, W, H);
  drawBricks();
  drawPaddle();
  drawBall();

  if (state === "playing") {
    update();
  } else if (state === "start") {
    drawMessage(["ブロック崩し", "スペース / クリックでスタート"]);
  } else if (state === "gameover") {
    drawMessage(["ゲームオーバー", "スペース / クリックでリスタート"]);
  } else if (state === "win") {
    drawMessage(["クリア！おめでとう🎉", "スペース / クリックでもう一度"]);
  }

  requestAnimationFrame(loop);
}

// --- 入力処理 ---
function startOrRestart() {
  if (state === "playing") return;
  if (state === "gameover" || state === "win") {
    resetGame();
  }
  state = "playing";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftPressed = true;
  else if (e.key === "ArrowRight") rightPressed = true;
  else if (e.key === " " || e.code === "Space") {
    e.preventDefault();
    startOrRestart();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftPressed = false;
  else if (e.key === "ArrowRight") rightPressed = false;
});

function movePaddleTo(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w / 2));
}

canvas.addEventListener("mousemove", (e) => movePaddleTo(e.clientX));
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length) movePaddleTo(e.touches[0].clientX);
}, { passive: false });

canvas.addEventListener("click", startOrRestart);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startOrRestart();
}, { passive: false });

// --- 初期化 ---
resetGame();
loop();
