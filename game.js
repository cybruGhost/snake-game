// Game Constants
const CELL_SIZE = 20
const INITIAL_SPEED = 200
const LEVEL_THRESHOLD = 5
const MAX_LEVEL = 5

// Game Variables
let canvas, ctx
let snake = []
let food = {}
let obstacles = []
let villagers = []
let score = 0
let level = 1
let speed = INITIAL_SPEED
let direction = "right"
let nextDirection = "right"
let gameLoop
let isPaused = false
let isGameOver = false
let foodEatenInLevel = 0

// Theme Settings
const themes = {
  forest: {
    background: "#232931",
    snake: "#4ecca3",
    snakeHead: "#2e8b57",
    food: "#ff6b6b",
    obstacle: "#a0522d",
    villager: "#ffd700",
    border: "#4ecca3",
  },
  desert: {
    background: "#e6ccb2",
    snake: "#e67e22",
    snakeHead: "#d35400",
    food: "#3498db",
    obstacle: "#7f5539",
    villager: "#f4d03f",
    border: "#d35400",
  },
  snow: {
    background: "#ecf0f1",
    snake: "#3498db",
    snakeHead: "#2980b9",
    food: "#e74c3c",
    obstacle: "#7f8c8d",
    villager: "#bdc3c7",
    border: "#3498db",
  },
  neon: {
    background: "#000000",
    snake: "#39ff14",
    snakeHead: "#00ff00",
    food: "#ff00ff",
    obstacle: "#4b0082",
    villager: "#00ffff",
    border: "#ff00ff",
  },
}

let currentTheme = "forest"

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners for menu navigation
  document.getElementById("play-btn").addEventListener("click", startGame)
  document.getElementById("settings-btn").addEventListener("click", showSettings)
  document.getElementById("about-btn").addEventListener("click", showAbout)
  document.getElementById("settings-back").addEventListener("click", showMenu)
  document.getElementById("about-back").addEventListener("click", showMenu)
  document.getElementById("menu-btn").addEventListener("click", showMenu)
  document.getElementById("play-again").addEventListener("click", startGame)
  document.getElementById("back-to-menu").addEventListener("click", showMenu)

  // Set up control buttons
  document.getElementById("up-btn").addEventListener("click", () => setDirection("up"))
  document.getElementById("down-btn").addEventListener("click", () => setDirection("down"))
  document.getElementById("left-btn").addEventListener("click", () => setDirection("left"))
  document.getElementById("right-btn").addEventListener("click", () => setDirection("right"))
  document.getElementById("pause-btn").addEventListener("click", togglePause)

  // Set up settings controls
  document.getElementById("difficulty").addEventListener("change", changeDifficulty)
  document.getElementById("theme").addEventListener("change", changeTheme)

  // Set up keyboard controls
  document.addEventListener("keydown", handleKeyPress)

  // Get canvas and context
  canvas = document.getElementById("game-canvas")
  ctx = canvas.getContext("2d")

  // Initialize game
  resetGame()
})

// Screen Navigation Functions
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active")
  })

  // Show the requested screen
  document.getElementById(screenId).classList.add("active")
}

function showMenu() {
  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }
  showScreen("menu-screen")
}

function showSettings() {
  showScreen("settings-screen")
}

function showAbout() {
  showScreen("about-screen")
}

function showGameOver() {
  document.getElementById("final-score").textContent = `Score: ${score}`
  document.getElementById("final-level").textContent = `Level: ${level}`
  showScreen("game-over-screen")
}

// Game Functions
function startGame() {
  resetGame()
  showScreen("game-screen")
  gameLoop = setInterval(updateGame, speed)
}

function resetGame() {
  // Reset snake
  snake = [
    { x: 3 * CELL_SIZE, y: 10 * CELL_SIZE },
    { x: 2 * CELL_SIZE, y: 10 * CELL_SIZE },
    { x: 1 * CELL_SIZE, y: 10 * CELL_SIZE },
  ]

  // Reset game state
  direction = "right"
  nextDirection = "right"
  score = 0
  level = 1
  speed = INITIAL_SPEED
  isPaused = false
  isGameOver = false
  foodEatenInLevel = 0
  obstacles = []
  villagers = []

  // Place food
  placeFood()

  // Update UI
  updateScore()
  updateLevel()

  // Apply theme
  applyTheme()
}

function updateGame() {
  if (isPaused || isGameOver) return

  // Update direction
  direction = nextDirection

  // Move snake
  moveSnake()

  // Move villagers in higher levels
  if (level >= 3) {
    moveVillagers()
  }

  // Check for collisions
  if (checkCollision()) {
    gameOver()
    return
  }

  // Check if food eaten
  checkFood()

  // Draw everything
  drawGame()
}

function moveSnake() {
  // Create new head based on direction
  const head = { x: snake[0].x, y: snake[0].y }

  switch (direction) {
    case "up":
      head.y -= CELL_SIZE
      break
    case "down":
      head.y += CELL_SIZE
      break
    case "left":
      head.x -= CELL_SIZE
      break
    case "right":
      head.x += CELL_SIZE
      break
  }

  // Handle wrapping around edges
  if (head.x < 0) head.x = canvas.width - CELL_SIZE
  if (head.x >= canvas.width) head.x = 0
  if (head.y < 0) head.y = canvas.height - CELL_SIZE
  if (head.y >= canvas.height) head.y = 0

  // Add new head
  snake.unshift(head)

  // Remove tail unless food was eaten
  if (head.x !== food.x || head.y !== food.y) {
    snake.pop()
  }
}

function moveVillagers() {
  villagers.forEach((villager, index) => {
    // Villagers try to move away from snake head
    const head = snake[0]
    const distX = head.x - villager.x
    const distY = head.y - villager.y

    // Determine direction to move (away from snake)
    let moveX = 0
    let moveY = 0

    if (Math.abs(distX) > Math.abs(distY)) {
      // Move horizontally
      moveX = distX > 0 ? -CELL_SIZE : CELL_SIZE
    } else {
      // Move vertically
      moveY = distY > 0 ? -CELL_SIZE : CELL_SIZE
    }

    // Only move if new position is valid
    const newX = villager.x + moveX
    const newY = villager.y + moveY

    if (isValidPosition(newX, newY)) {
      villagers[index].x = newX
      villagers[index].y = newY
    }
  })
}

function checkCollision() {
  const head = snake[0]

  // Check collision with self
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true
    }
  }

  // Check collision with obstacles
  for (const obstacle of obstacles) {
    if (head.x === obstacle.x && head.y === obstacle.y) {
      return true
    }
  }

  return false
}

function checkFood() {
  const head = snake[0]

  if (head.x === food.x && head.y === food.y) {
    // Increase score
    score += level * 10
    updateScore()

    // Place new food
    placeFood()

    // Increase speed slightly
    speed = Math.max(50, speed - 5)
    clearInterval(gameLoop)
    gameLoop = setInterval(updateGame, speed)

    // Track food eaten in level
    foodEatenInLevel++

    // Check for level up
    if (foodEatenInLevel >= LEVEL_THRESHOLD && level < MAX_LEVEL) {
      levelUp()
    }
  }
}

function levelUp() {
  level++
  foodEatenInLevel = 0
  updateLevel()

  // Show level up notification
  const levelUpNotification = document.getElementById("level-up")
  levelUpNotification.style.display = "block"
  setTimeout(() => {
    levelUpNotification.style.display = "none"
  }, 2000)

  // Add obstacles based on level
  addObstacles()

  // Add villagers in higher levels
  if (level >= 3) {
    addVillagers()
  }
}

function gameOver() {
  isGameOver = true
  clearInterval(gameLoop)
  gameLoop = null
  showGameOver()
}

// Helper Functions
function placeFood() {
  let validPosition = false

  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE,
      y: Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE,
    }

    validPosition = isValidPosition(food.x, food.y)
  }
}

function addObstacles() {
  obstacles = []

  const numObstacles = level * 2

  for (let i = 0; i < numObstacles; i++) {
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

      validPosition = isValidPosition(x, y)
    }

    obstacles.push({ x, y })
  }
}

function addVillagers() {
  villagers = []

  const numVillagers = level - 2 // Start with 1 villager at level 3

  for (let i = 0; i < numVillagers; i++) {
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

      // Make sure villagers are placed away from snake
      let tooClose = false
      for (const segment of snake) {
        const distance = Math.sqrt(Math.pow(segment.x - x, 2) + Math.pow(segment.y - y, 2))
        if (distance < 5 * CELL_SIZE) {
          tooClose = true
          break
        }
      }

      validPosition = !tooClose && isValidPosition(x, y)
    }

    villagers.push({ x, y })
  }
}

function isValidPosition(x, y) {
  // Check if position is occupied by snake
  for (const segment of snake) {
    if (segment.x === x && segment.y === y) {
      return false
    }
  }

  // Check if position is occupied by food
  if (food.x === x && food.y === y) {
    return false
  }

  // Check if position is occupied by obstacle
  for (const obstacle of obstacles) {
    if (obstacle.x === x && obstacle.y === y) {
      return false
    }
  }

  // Check if position is occupied by villager
  for (const villager of villagers) {
    if (villager.x === x && villager.y === y) {
      return false
    }
  }

  return true
}

function drawGame() {
  const colors = themes[currentTheme]

  // Clear canvas
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? colors.snakeHead : colors.snake
    ctx.fillRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE)

    // Add eyes to head
    if (i === 0) {
      ctx.fillStyle = "#000000"

      // Position eyes based on direction
      switch (direction) {
        case "up":
          ctx.fillRect(snake[i].x + 5, snake[i].y + 3, 3, 3)
          ctx.fillRect(snake[i].x + 12, snake[i].y + 3, 3, 3)
          break
        case "down":
          ctx.fillRect(snake[i].x + 5, snake[i].y + 14, 3, 3)
          ctx.fillRect(snake[i].x + 12, snake[i].y + 14, 3, 3)
          break
        case "left":
          ctx.fillRect(snake[i].x + 3, snake[i].y + 5, 3, 3)
          ctx.fillRect(snake[i].x + 3, snake[i].y + 12, 3, 3)
          break
        case "right":
          ctx.fillRect(snake[i].x + 14, snake[i].y + 5, 3, 3)
          ctx.fillRect(snake[i].x + 14, snake[i].y + 12, 3, 3)
          break
      }
    }
  }

  // Draw food
  ctx.fillStyle = colors.food
  ctx.beginPath()
  ctx.arc(food.x + CELL_SIZE / 2, food.y + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw obstacles
  ctx.fillStyle = colors.obstacle
  for (const obstacle of obstacles) {
    ctx.beginPath()
    ctx.moveTo(obstacle.x, obstacle.y + CELL_SIZE)
    ctx.lineTo(obstacle.x + CELL_SIZE / 3, obstacle.y + CELL_SIZE / 3)
    ctx.lineTo(obstacle.x + CELL_SIZE, obstacle.y + CELL_SIZE / 2)
    ctx.lineTo(obstacle.x + CELL_SIZE * 0.8, obstacle.y + CELL_SIZE)
    ctx.fill()
  }

  // Draw villagers
  ctx.fillStyle = colors.villager
  for (const villager of villagers) {
    // Head
    ctx.beginPath()
    ctx.arc(villager.x + CELL_SIZE / 2, villager.y + CELL_SIZE / 3, CELL_SIZE / 4, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillRect(villager.x + CELL_SIZE * 0.4, villager.y + CELL_SIZE / 3, CELL_SIZE * 0.2, CELL_SIZE * 0.5)

    // Arms
    ctx.fillRect(villager.x + CELL_SIZE * 0.2, villager.y + CELL_SIZE * 0.5, CELL_SIZE * 0.6, CELL_SIZE * 0.1)

    // Legs
    ctx.fillRect(villager.x + CELL_SIZE * 0.3, villager.y + CELL_SIZE * 0.7, CELL_SIZE * 0.1, CELL_SIZE * 0.3)
    ctx.fillRect(villager.x + CELL_SIZE * 0.6, villager.y + CELL_SIZE * 0.7, CELL_SIZE * 0.1, CELL_SIZE * 0.3)
  }
}

// UI Functions
function updateScore() {
  document.getElementById("score").textContent = `Score: ${score}`
}

function updateLevel() {
  document.getElementById("level").textContent = `Level: ${level}`
}

// Control Functions
function setDirection(newDirection) {
  // Prevent 180-degree turns
  if (
    (direction === "up" && newDirection === "down") ||
    (direction === "down" && newDirection === "up") ||
    (direction === "left" && newDirection === "right") ||
    (direction === "right" && newDirection === "left")
  ) {
    return
  }

  nextDirection = newDirection
}

function handleKeyPress(e) {
  switch (e.key) {
    case "ArrowUp":
      setDirection("up")
      break
    case "ArrowDown":
      setDirection("down")
      break
    case "ArrowLeft":
      setDirection("left")
      break
    case "ArrowRight":
      setDirection("right")
      break
    case "p":
    case "P":
      togglePause()
      break
    case "m":
    case "M":
      showMenu()
      break
  }
}

function togglePause() {
  isPaused = !isPaused
  const pauseBtn = document.getElementById("pause-btn")
  pauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>'
}

// Settings Functions
function changeDifficulty() {
  const difficulty = document.getElementById("difficulty").value

  switch (difficulty) {
    case "easy":
      speed = INITIAL_SPEED + 50
      break
    case "medium":
      speed = INITIAL_SPEED
      break
    case "hard":
      speed = INITIAL_SPEED - 50
      break
  }

  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = setInterval(updateGame, speed)
  }
}

function changeTheme() {
  currentTheme = document.getElementById("theme").value
  document.getElementById("theme-display").textContent =
    `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`
  applyTheme()
}

function applyTheme() {
  const colors = themes[currentTheme]
  canvas.style.borderColor = colors.border

  // If game is active, redraw
  if (snake.length > 0) {
    drawGame()
  }
}
