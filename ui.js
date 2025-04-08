// Declare global variables
let canvas
let ctx
let snake
const CELL_SIZE = 20
let food
let obstacles
let villagers
let score
let level
let speed
const INITIAL_SPEED = 200 // Added declaration
let isPaused = false // Added declaration
let isGameOver = false // Added declaration
let currentDirection = "Right" // Added declaration
let nextDirection = "Right" // Added declaration

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  canvas = document.getElementById("gameCanvas")
  ctx = canvas.getContext("2d")

  // Initialize game elements
  initGame()

  // Event listeners for menu navigation
  document.getElementById("start-game").addEventListener("click", startGame)
  document.getElementById("open-settings").addEventListener("click", openSettings)
  document.getElementById("open-about").addEventListener("click", openAbout)
  document.getElementById("settings-back").addEventListener("click", backToMenu)
  document.getElementById("about-back").addEventListener("click", backToMenu)
  document.getElementById("menu-button").addEventListener("click", backToMenu)
  document.getElementById("pause").addEventListener("click", togglePause)
  document.getElementById("restart-game").addEventListener("click", startGame)
  document.getElementById("game-over-menu").addEventListener("click", backToMenu)

  // Control buttons
  document.getElementById("up").addEventListener("click", () => changeDirection("Up"))
  document.getElementById("down").addEventListener("click", () => changeDirection("Down"))
  document.getElementById("left").addEventListener("click", () => changeDirection("Left"))
  document.getElementById("right").addEventListener("click", () => changeDirection("Right"))

  // Settings controls
  document.getElementById("difficulty").addEventListener("change", changeDifficulty)
  document.getElementById("theme-select").addEventListener("change", changeTheme)
  document.getElementById("sound-toggle").addEventListener("change", toggleSound)

  // Keyboard controls
  window.addEventListener("keydown", handleKeyDown)
})

// Initialize game elements
function initGame() {
  // Set up the snake
  snake = {
    body: [
      { x: 3 * CELL_SIZE, y: 10 * CELL_SIZE },
      { x: 2 * CELL_SIZE, y: 10 * CELL_SIZE },
      { x: 1 * CELL_SIZE, y: 10 * CELL_SIZE },
    ],
    direction: "Right",
  }

  // Initialize food, obstacles, and villagers
  food = { x: 0, y: 0 }
  obstacles = []
  villagers = []

  // Reset game state
  score = 0
  level = 1
  speed = INITIAL_SPEED
  isPaused = false
  isGameOver = false
  currentDirection = "Right"
  nextDirection = "Right"
  foodEatenInLevel = 0

  // Place initial food
  placeFood()

  // Update UI
  updateScoreDisplay()
  updateLevelDisplay()

  // Apply theme
  applyTheme(currentTheme)
}

// Screen navigation functions
function startGame() {
  hideAllScreens()
  document.getElementById("game-screen").classList.add("active")
  initGame()
  if (gameInterval) clearInterval(gameInterval)
  gameInterval = setInterval(gameLoop, speed)
}

function openSettings() {
  hideAllScreens()
  document.getElementById("settings-screen").classList.add("active")
}

function openAbout() {
  hideAllScreens()
  document.getElementById("about-screen").classList.add("active")
}

function backToMenu() {
  hideAllScreens()
  document.getElementById("menu-screen").classList.add("active")
  if (gameInterval) clearInterval(gameInterval)
}

function showGameOver() {
  hideAllScreens()
  document.getElementById("game-over-screen").classList.add("active")
  document.getElementById("final-score").textContent = `Score: ${score}`
  document.getElementById("final-level").textContent = `Level: ${level}`
}

function hideAllScreens() {
  const screens = document.querySelectorAll(".screen")
  screens.forEach((screen) => screen.classList.remove("active"))
}

// Game control functions
function togglePause() {
  isPaused = !isPaused
  const pauseButton = document.getElementById("pause")
  pauseButton.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>'
}

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

  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = setInterval(gameLoop, speed)
  }
}

function changeTheme() {
  currentTheme = document.getElementById("theme-select").value
  applyTheme(currentTheme)
  document.getElementById("current-theme").textContent =
    `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`
}

function toggleSound() {
  soundEnabled = document.getElementById("sound-toggle").checked
}

function applyTheme(theme) {
  const themeColors = themes[theme]
  canvas.style.backgroundColor = themeColors.background
  canvas.style.borderColor = themeColors.border

  // If game is active, redraw everything with new theme
  if (snake && food) {
    drawGame()
  }
}

// Input handling
function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowUp":
      changeDirection("Up")
      break
    case "ArrowDown":
      changeDirection("Down")
      break
    case "ArrowLeft":
      changeDirection("Left")
      break
    case "ArrowRight":
      changeDirection("Right")
      break
    case "p":
    case "P":
      togglePause()
      break
    case "m":
    case "M":
      backToMenu()
      break
  }
}

function changeDirection(newDirection) {
  // Prevent 180-degree turns
  if (
    (currentDirection === "Up" && newDirection === "Down") ||
    (currentDirection === "Down" && newDirection === "Up") ||
    (currentDirection === "Left" && newDirection === "Right") ||
    (currentDirection === "Right" && newDirection === "Left")
  ) {
    return
  }

  nextDirection = newDirection
}

// Game mechanics
function gameLoop() {
  if (isPaused || isGameOver) return

  // Update direction
  currentDirection = nextDirection

  // Move snake
  moveSnake()

  // Move villagers (in higher levels)
  if (level >= 3) {
    moveVillagers()
  }

  // Check collisions
  if (checkCollisions()) {
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
  const head = { x: snake.body[0].x, y: snake.body[0].y }

  switch (currentDirection) {
    case "Up":
      head.y -= CELL_SIZE
      break
    case "Down":
      head.y += CELL_SIZE
      break
    case "Left":
      head.x -= CELL_SIZE
      break
    case "Right":
      head.x += CELL_SIZE
      break
  }

  // Handle wrapping around the edges
  if (head.x < 0) head.x = canvas.width - CELL_SIZE
  if (head.x >= canvas.width) head.x = 0
  if (head.y < 0) head.y = canvas.height - CELL_SIZE
  if (head.y >= canvas.height) head.y = 0

  // Add new head to the beginning of the snake
  snake.body.unshift(head)

  // Remove tail unless food was eaten
  if (head.x !== food.x || head.y !== food.y) {
    snake.body.pop()
  }
}

function moveVillagers() {
  villagers.forEach((villager) => {
    // Villagers try to move away from the snake head
    const head = snake.body[0]
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

    // Only move if the new position is valid
    const newX = villager.x + moveX
    const newY = villager.y + moveY

    if (newX >= 0 && newX < canvas.width && newY >= 0 && newY < canvas.height && !isPositionOccupied(newX, newY)) {
      villager.x = newX
      villager.y = newY
    }
  })
}

function checkCollisions() {
  const head = snake.body[0]

  // Check collision with self
  for (let i = 1; i < snake.body.length; i++) {
    if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
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
  const head = snake.body[0]

  if (head.x === food.x && head.y === food.y) {
    // Increase score
    score += level * 10
    updateScoreDisplay()

    // Play sound
    if (soundEnabled) {
      sounds.eat.currentTime = 0
      sounds.eat.play().catch((e) => console.log("Audio play error:", e))
    }

    // Place new food
    placeFood()

    // Increase speed slightly
    speed = Math.max(50, speed - SPEED_INCREASE)
    clearInterval(gameInterval)
    gameInterval = setInterval(gameLoop, speed)

    // Track food eaten in this level
    foodEatenInLevel++

    // Check for level up
    if (foodEatenInLevel >= LEVEL_THRESHOLD && level < maxLevel) {
      levelUp()
    }
  }
}

function levelUp() {
  level++
  foodEatenInLevel = 0
  updateLevelDisplay()

  // Show level message
  const levelMessage = document.getElementById("level-message")
  levelMessage.classList.remove("hidden")
  setTimeout(() => {
    levelMessage.classList.add("hidden")
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
  clearInterval(gameInterval)
  showGameOver()
}

// Helper functions
function placeFood() {
  let validPosition = false

  while (!validPosition) {
    food.x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
    food.y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

    validPosition = !isPositionOccupied(food.x, food.y)
  }
}

function addObstacles() {
  // Clear existing obstacles
  obstacles = []

  // Add obstacles based on level
  const numObstacles = level * 2

  for (let i = 0; i < numObstacles; i++) {
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

      validPosition = !isPositionOccupied(x, y)
    }

    obstacles.push({ x, y })
  }
}

function addVillagers() {
  // Clear existing villagers
  villagers = []

  // Add villagers based on level
  const numVillagers = level - 2 // Start with 1 villager at level 3

  for (let i = 0; i < numVillagers; i++) {
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

      // Make sure villagers are placed away from the snake
      const minDistance = 5 * CELL_SIZE
      let tooClose = false

      for (const segment of snake.body) {
        const distance = Math.sqrt(Math.pow(segment.x - x, 2) + Math.pow(segment.y - y, 2))

        if (distance < minDistance) {
          tooClose = true
          break
        }
      }

      validPosition = !tooClose && !isPositionOccupied(x, y)
    }

    villagers.push({ x, y })
  }
}

function isPositionOccupied(x, y) {
  // Check if position is occupied by snake
  for (const segment of snake.body) {
    if (segment.x === x && segment.y === y) {
      return true
    }
  }

  // Check if position is occupied by food
  if (food.x === x && food.y === y) {
    return true
  }

  // Check if position is occupied by obstacle
  for (const obstacle of obstacles) {
    if (obstacle.x === x && obstacle.y === y) {
      return true
    }
  }

  // Check if position is occupied by villager
  for (const villager of villagers) {
    if (villager.x === x && villager.y === y) {
      return true
    }
  }

  return false
}

function drawGame() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const themeColors = themes[currentTheme]

  // Draw snake
  for (let i = 0; i < snake.body.length; i++) {
    const segment = snake.body[i]

    // Use different color for head
    if (i === 0) {
      ctx.fillStyle = themeColors.snakeHead
    } else {
      ctx.fillStyle = themeColors.snake
    }

    ctx.fillRect(segment.x, segment.y, CELL_SIZE, CELL_SIZE)

    // Add eyes to head
    if (i === 0) {
      ctx.fillStyle = "#000000"

      // Position eyes based on direction
      switch (currentDirection) {
        case "Up":
          ctx.fillRect(segment.x + CELL_SIZE * 0.2, segment.y + CELL_SIZE * 0.1, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          ctx.fillRect(segment.x + CELL_SIZE * 0.6, segment.y + CELL_SIZE * 0.1, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          break
        case "Down":
          ctx.fillRect(segment.x + CELL_SIZE * 0.2, segment.y + CELL_SIZE * 0.7, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          ctx.fillRect(segment.x + CELL_SIZE * 0.6, segment.y + CELL_SIZE * 0.7, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          break
        case "Left":
          ctx.fillRect(segment.x + CELL_SIZE * 0.1, segment.y + CELL_SIZE * 0.2, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          ctx.fillRect(segment.x + CELL_SIZE * 0.1, segment.y + CELL_SIZE * 0.6, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          break
        case "Right":
          ctx.fillRect(segment.x + CELL_SIZE * 0.7, segment.y + CELL_SIZE * 0.2, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          ctx.fillRect(segment.x + CELL_SIZE * 0.7, segment.y + CELL_SIZE * 0.6, CELL_SIZE * 0.2, CELL_SIZE * 0.2)
          break
      }
    }
  }

  // Draw food
  ctx.fillStyle = themeColors.food
  ctx.beginPath()
  ctx.arc(food.x + CELL_SIZE / 2, food.y + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw obstacles
  ctx.fillStyle = themeColors.obstacle
  for (const obstacle of obstacles) {
    // Draw rock-like obstacle
    ctx.beginPath()
    ctx.moveTo(obstacle.x, obstacle.y + CELL_SIZE)
    ctx.lineTo(obstacle.x + CELL_SIZE / 3, obstacle.y + CELL_SIZE / 3)
    ctx.lineTo(obstacle.x + CELL_SIZE, obstacle.y + CELL_SIZE / 2)
    ctx.lineTo(obstacle.x + CELL_SIZE * 0.8, obstacle.y + CELL_SIZE)
    ctx.fill()
  }

  // Draw villagers
  ctx.fillStyle = themeColors.villager
  for (const villager of villagers) {
    // Draw villager (simple person shape)
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

function updateScoreDisplay() {
  document.getElementById("score-display").textContent = `Score: ${score}`
}

function updateLevelDisplay() {
  document.getElementById("level-display").textContent = `Level: ${level}`
}
