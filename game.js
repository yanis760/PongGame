const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 20;
const BALL_SIZE = 16;

// Player paddle
const player = {
  x: PADDLE_MARGIN,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#1abc9c"
};

// AI paddle
const ai = {
  x: WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
  y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#e67e22",
  speed: 4
};

// Ball
const ball = {
  x: WIDTH / 2 - BALL_SIZE / 2,
  y: HEIGHT / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speed: 5,
  velocityX: 5,
  velocityY: 5,
  color: "#fff"
};

// Scores
let playerScore = 0;
let aiScore = 0;

// Draw functions
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color, size = 36) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

// Game drawing
function render() {
  // Clear
  drawRect(0, 0, WIDTH, HEIGHT, "#222");

  // Net
  for (let i = 0; i < HEIGHT; i += 32) {
    drawRect(WIDTH / 2 - 2, i, 4, 16, "#fff");
  }

  // Paddles & Ball
  drawRect(player.x, player.y, player.width, player.height, player.color);
  drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
  drawCircle(ball.x, ball.y, ball.size / 2, ball.color);

  // Scores
  drawText(playerScore, WIDTH / 2 - 60, 50, "#1abc9c");
  drawText(aiScore, WIDTH / 2 + 60, 50, "#e67e22");
}

// Paddle movement
canvas.addEventListener('mousemove', function(evt) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = evt.clientY - rect.top;
  player.y = mouseY - player.height / 2;

  // Clamp
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// AI movement
function moveAI() {
  // Simple AI: move towards the ball
  let center = ai.y + ai.height / 2;
  if (ball.y < center - 10) {
    ai.y -= ai.speed;
  } else if (ball.y > center + 10) {
    ai.y += ai.speed;
  }
  // Clamp
  if (ai.y < 0) ai.y = 0;
  if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Ball movement and collision
function updateBall() {
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Top / Bottom wall
  if (ball.y - ball.size / 2 < 0) {
    ball.y = ball.size / 2;
    ball.velocityY = -ball.velocityY;
  } else if (ball.y + ball.size / 2 > HEIGHT) {
    ball.y = HEIGHT - ball.size / 2;
    ball.velocityY = -ball.velocityY;
  }

  // Left paddle collision
  if (
    ball.x - ball.size / 2 < player.x + player.width &&
    ball.x - ball.size / 2 > player.x &&
    ball.y + ball.size / 2 > player.y &&
    ball.y - ball.size / 2 < player.y + player.height
  ) {
    ball.x = player.x + player.width + ball.size / 2;
    ball.velocityX = -ball.velocityX;
    // Add a bit of "spin" based on where the ball hits the paddle
    let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    ball.velocityY = ball.speed * collidePoint;
  }

  // Right paddle collision
  if (
    ball.x + ball.size / 2 > ai.x &&
    ball.x + ball.size / 2 < ai.x + ai.width &&
    ball.y + ball.size / 2 > ai.y &&
    ball.y - ball.size / 2 < ai.y + ai.height
  ) {
    ball.x = ai.x - ball.size / 2;
    ball.velocityX = -ball.velocityX;
    let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
    ball.velocityY = ball.speed * collidePoint;
  }

  // Score left or right
  if (ball.x - ball.size / 2 < 0) {
    aiScore++;
    resetBall();
  }
  if (ball.x + ball.size / 2 > WIDTH) {
    playerScore++;
    resetBall();
  }
}

function resetBall() {
  ball.x = WIDTH / 2 - BALL_SIZE / 2;
  ball.y = HEIGHT / 2 - BALL_SIZE / 2;
  ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
}

// Main game loop
function gameLoop() {
  moveAI();
  updateBall();
  render();
  requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();