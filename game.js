<<<<<<< HEAD
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
=======
// Game constants and variables
const CELL_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREASE = 10
const LEVEL_THRESHOLD = 5 // Food items to eat before level up

// Game state
let canvas, ctx
let snake, food, obstacles, villagers
let score = 0
let level = 1
let speed = INITIAL_SPEED
let gameInterval
let isPaused = false
let isGameOver = false
let currentDirection = "Right"
let nextDirection = "Right"
let foodEatenInLevel = 0
const maxLevel = 5

// Theme settings
let currentTheme = "forest"
const themes = {
  forest: {
    background: "#2d4a22",
    snake: "#7fff00",
    snakeHead: "#32cd32",
    food: "#ff6347",
    obstacle: "#8b4513",
    villager: "#ffd700",
    border: "#006400",
  },
  desert: {
    background: "#c2b280",
    snake: "#ff8c00",
    snakeHead: "#ff4500",
    food: "#00ced1",
    obstacle: "#8b4513",
    villager: "#f0e68c",
    border: "#d2691e",
  },
  snow: {
    background: "#f0f8ff",
    snake: "#1e90ff",
    snakeHead: "#0000cd",
    food: "#ff69b4",
    obstacle: "#708090",
    villager: "#ffffff",
    border: "#87ceeb",
  },
  neon: {
    background: "#000000",
    snake: "#00ff00",
    snakeHead: "#39ff14",
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    food: "#ff00ff",
    obstacle: "#4b0082",
    villager: "#00ffff",
    border: "#ff00ff",
  },
}

<<<<<<< HEAD
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
=======
// Sound effects
let soundEnabled = true
const sounds = {\
    eat: new Audio('data:audio/wav;base64,UklGRl9JAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTtJAACBhYqFbF1fdJmxrYhwZHKRo6GPc11OW3aRqbSrmHleWWFwgIuTlpGHdWRVVWRygISEgHlwaWRjZGp0f4mVm5+gnZiRiYF8eXh8gYeNkpWWlJGMhoB6dXFvcnZ8goiNkJKSkY+MioiHh4iKjI6QkZKSkZCOjYuKiYmJiouMjY2NjYyMi4qJiYiIiYqLjI2Ojo6OjYyLioqJiYqLjI2Ojo+Pj46NjIuLioqLjI2Oj5CQkJCPjo2MjIuLjI2Oj5CRkZGQkI+OjYyMjIyNjo+QkZGRkZCQj46NjY2Njo+QkZGSkpKRkZCPjo6Ojo+QkZKSk5OTkpKRkJCPj4+QkZKTk5SUlJOTkpGRkJCQkZKTlJWVlZWUlJOSkpGRkZGSk5SVlpaWlpWVlJOTkpKSk5SVlpeXl5eXlpaVlJSUlJSVlpeYmJiYmJeXlpaVlZWVlpeYmZmZmZmYmJeXlpaWlpeYmZqampqampmYmJeXl5eYmZqbm5ubm5qamZmYmJiYmZqbnJycnJybm5qamZmZmZqbnJydnZ2dnJybmpmZmZqbnJ2enp6enp2dnJubmpqbnJ2en5+fn5+enp2dnJycnJ2en6CgoKCgn5+enp2dnZ2en6ChoaGhoaCgn5+enp6en6ChoqKioqKhoaGgoJ+fn6CgoaKjo6OjoqKioaCgoKCgoaKjpKSkpKSjo6OioqGhoaGio6SlpaWlpKSjo6OioqKio6SlpaampqWlpKSjo6OjpKSlpqenp6enpqampaWkpKSlpqeoqKioqKinp6ampqWlpqeoqampqamoqKinp6enp6eoqaqrq6urqqqpqainp6eoqaqrq6ysrKyrq6qqqainp6ipqqusra2tra2srKuqqqqpqaqrrK2urq6uraysq6uqqqqrrK2ur6+vr66uraysq6urrK2ur7CwsLCvrq6tra2srK2ur7CxsbGxsLCvrq6tra2ur7CxsbKysrGxsK+vrq6ur7CxsrKzs7OysrGwsK+vr7CxsrO0tLS0s7OysbGwsLCwsbKztLW1tbW0tLOysbGxsbGys7S1tra2trW1tLOzssLBwL++vby7urm5uLi3t7a2tbW0tLOzs7KysbGxsLCwsLCvrq6urq2traysrKuqqqqpqamoqKinp6enpqalpaWko6OjoqKioaGhoaCgoJ+fn5+enp6dnZ2dnJycnJubm5uampqamZmZmZiYmJiYl5eXl5aWlpaVlZWVlJSUlJOTk5OTkpKSkpGRkZGRkJCQkJCPj4+Pj4+Ojo6Ojo2NjY2NjY2MjIyMjIyLi4uLi4uLioqKioqKiYmJiYmJiYmIiIiIiIiIiIeHh4eHh4eHh4aGhoaGhoaGhoaGhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFh


```js file="ui.js"
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize game elements
    initGame();
    
    // Event listeners for menu navigation
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('open-settings').addEventListener('click', openSettings);
    document.getElementById('open-about').addEventListener('click', openAbout);
    document.getElementById('settings-back').addEventListener('click', backToMenu);
    document.getElementById('about-back').addEventListener('click', backToMenu);
    document.getElementById('menu-button').addEventListener('click', backToMenu);
    document.getElementById('pause').addEventListener('click', togglePause);
    document.getElementById('restart-game').addEventListener('click', startGame);
    document.getElementById('game-over-menu').addEventListener('click', backToMenu);
    
    // Control buttons
    document.getElementById('up').addEventListener('click', () => changeDirection('Up'));
    document.getElementById('down').addEventListener('click', () => changeDirection('Down'));
    document.getElementById('left').addEventListener('click', () => changeDirection('Left'));
    document.getElementById('right').addEventListener('click', () => changeDirection('Right'));
    
    // Settings controls
    document.getElementById('difficulty').addEventListener('change', changeDifficulty);
    document.getElementById('theme-select').addEventListener('change', changeTheme);
    document.getElementById('sound-toggle').addEventListener('change', toggleSound);
    
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
});

// Initialize game elements
function initGame() {
    // Set up the snake
    snake = {
        body: [
            { x: 3 * CELL_SIZE, y: 10 * CELL_SIZE },
            { x: 2 * CELL_SIZE, y: 10 * CELL_SIZE },
            { x: 1 * CELL_SIZE, y: 10 * CELL_SIZE }
        ],
        direction: 'Right'
    };
    
    // Initialize food, obstacles, and villagers
    food = { x: 0, y: 0 };
    obstacles = [];
    villagers = [];
    
    // Reset game state
    score = 0;
    level = 1;
    speed = INITIAL_SPEED;
    isPaused = false;
    isGameOver = false;
    currentDirection = 'Right';
    nextDirection = 'Right';
    foodEatenInLevel = 0;
    
    // Place initial food
    placeFood();
    
    // Update UI
    updateScoreDisplay();
    updateLevelDisplay();
    
    // Apply theme
    applyTheme(currentTheme);
}

// Screen navigation functions
function startGame() {
    hideAllScreens();
    document.getElementById('game-screen').classList.add('active');
    initGame();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
}

function openSettings() {
    hideAllScreens();
    document.getElementById('settings-screen').classList.add('active');
}

function openAbout() {
    hideAllScreens();
    document.getElementById('about-screen').classList.add('active');
}

function backToMenu() {
    hideAllScreens();
    document.getElementById('menu-screen').classList.add('active');
    if (gameInterval) clearInterval(gameInterval);
}

function showGameOver() {
    hideAllScreens();
    document.getElementById('game-over-screen').classList.add('active');
    document.getElementById('final-score').textContent = `Score: ${score}`;
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
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a

  // Move snake
  moveSnake()

<<<<<<< HEAD
  // Move villagers in higher levels
=======
  // Move villagers (in higher levels)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  if (level >= 3) {
    moveVillagers()
  }

<<<<<<< HEAD
  // Check for collisions
  if (checkCollision()) {
=======
  // Check collisions
  if (checkCollisions()) {
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
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
<<<<<<< HEAD
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
=======
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
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
      head.x += CELL_SIZE
      break
  }

<<<<<<< HEAD
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
=======
  // Handle wrapping around the edges
  if (head.x &lt;
  0
  ) head.x = canvas.width - CELL_SIZE
  if (head.x >= canvas.width) head.x = 0
  if (head.y &lt;
  0
  ) head.y = canvas.height - CELL_SIZE
  if (head.y >= canvas.height) head.y = 0

  // Add new head to the beginning of the snake
  snake.body.unshift(head)

  // Remove tail unless food was eaten
  if (head.x !== food.x || head.y !== food.y) {
    snake.body.pop()
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  }
}

function moveVillagers() {
<<<<<<< HEAD
  villagers.forEach((villager, index) => {
    // Villagers try to move away from snake head
    const head = snake[0]
=======
  villagers.forEach((villager) => {
    // Villagers try to move away from the snake head
    const head = snake.body[0]
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
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

<<<<<<< HEAD
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
=======
    // Only move if the new position is valid
    const newX = villager.x + moveX
    const newY = villager.y + moveY

    if (
            newX >= 0 && newX &lt;
    canvas.width && newY >= 0 && newY & lt
    canvas.height && !isPositionOccupied(newX, newY)
    )
    villager.x = newX
    villager.y = newY
  })
}

function checkCollisions() {
  const head = snake.body[0]

  // Check collision with self
  for (let i = 1; i &lt; snake.body.length;
  i++
  )
  if (head.x === snake.body[i].x && head.y === snake.body[i].y) {
    return true
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
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
<<<<<<< HEAD
  const head = snake[0]
=======
  const head = snake.body[0]
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a

  if (head.x === food.x && head.y === food.y) {
    // Increase score
    score += level * 10
<<<<<<< HEAD
    updateScore()
=======
    updateScoreDisplay()

    // Play sound
    if (soundEnabled) {
      sounds.eat.currentTime = 0
      sounds.eat.play().catch((e) => console.log("Audio play error:", e))
    }
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a

    // Place new food
    placeFood()

    // Increase speed slightly
<<<<<<< HEAD
    speed = Math.max(50, speed - 5)
    clearInterval(gameLoop)
    gameLoop = setInterval(updateGame, speed)

    // Track food eaten in level
    foodEatenInLevel++

    // Check for level up
    if (foodEatenInLevel >= LEVEL_THRESHOLD && level < MAX_LEVEL) {
      levelUp()
    }
=======
    speed = Math.max(50, speed - SPEED_INCREASE)
    clearInterval(gameInterval)
    gameInterval = setInterval(gameLoop, speed)

    // Track food eaten in this level
    foodEatenInLevel++

    // Check for level up
    if (foodEatenInLevel >= LEVEL_THRESHOLD && level &lt;
    maxLevel
    )
    levelUp()
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  }
}

function levelUp() {
  level++
  foodEatenInLevel = 0
<<<<<<< HEAD
  updateLevel()

  // Show level up notification
  const levelUpNotification = document.getElementById("level-up")
  levelUpNotification.style.display = "block"
  setTimeout(() => {
    levelUpNotification.style.display = "none"
=======
  updateLevelDisplay()

  // Show level message
  const levelMessage = document.getElementById("level-message")
  levelMessage.classList.remove("hidden")
  setTimeout(() => {
    levelMessage.classList.add("hidden")
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
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
<<<<<<< HEAD
  clearInterval(gameLoop)
  gameLoop = null
  showGameOver()
}

// Helper Functions
=======
  clearInterval(gameInterval)
  showGameOver()
}

// Helper functions
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
function placeFood() {
  let validPosition = false

  while (!validPosition) {
<<<<<<< HEAD
    food = {
      x: Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE,
      y: Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE,
    }

    validPosition = isValidPosition(food.x, food.y)
=======
    food.x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
    food.y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

    validPosition = !isPositionOccupied(food.x, food.y)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  }
}

function addObstacles() {
<<<<<<< HEAD
  obstacles = []

  const numObstacles = level * 2

  for (let i = 0; i < numObstacles; i++) {
=======
  // Clear existing obstacles
  obstacles = []

  // Add obstacles based on level
  const numObstacles = level * 2

  for (let i = 0; i &lt; numObstacles;
  i++
  )
  {
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

<<<<<<< HEAD
      validPosition = isValidPosition(x, y)
=======
      validPosition = !isPositionOccupied(x, y)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    }

    obstacles.push({ x, y })
  }
}

function addVillagers() {
<<<<<<< HEAD
  villagers = []

  const numVillagers = level - 2 // Start with 1 villager at level 3

  for (let i = 0; i < numVillagers; i++) {
=======
  // Clear existing villagers
  villagers = []

  // Add villagers based on level
  const numVillagers = level - 2 // Start with 1 villager at level 3

  for (let i = 0; i &lt; numVillagers;
  i++
  )
  {
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    let x, y
    let validPosition = false

    while (!validPosition) {
      x = Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE
      y = Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE

<<<<<<< HEAD
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
=======
      // Make sure villagers are placed away from the snake
      const minDistance = 5 * CELL_SIZE
      let tooClose = false

      for (const segment of snake.body) {
        const distance = Math.sqrt(Math.pow(segment.x - x, 2) + Math.pow(segment.y - y, 2))

        if (distance &lt;
        minDistance
        )
        tooClose = true
        break
      }

      validPosition = !tooClose && !isPositionOccupied(x, y)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    }

    villagers.push({ x, y })
  }
}

<<<<<<< HEAD
function isValidPosition(x, y) {
  // Check if position is occupied by snake
  for (const segment of snake) {
    if (segment.x === x && segment.y === y) {
      return false
=======
function isPositionOccupied(x, y) {
  // Check if position is occupied by snake
  for (const segment of snake.body) {
    if (segment.x === x && segment.y === y) {
      return true
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    }
  }

  // Check if position is occupied by food
  if (food.x === x && food.y === y) {
<<<<<<< HEAD
    return false
=======
    return true
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  }

  // Check if position is occupied by obstacle
  for (const obstacle of obstacles) {
    if (obstacle.x === x && obstacle.y === y) {
<<<<<<< HEAD
      return false
=======
      return true
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    }
  }

  // Check if position is occupied by villager
  for (const villager of villagers) {
    if (villager.x === x && villager.y === y) {
<<<<<<< HEAD
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
=======
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
  for (let i = 0; i &lt; snake.body.length;
  i++
  )
  {
    const segment = snake.body[i]

    // Use different color for head
    if (i === 0) {
      ctx.fillStyle = themeColors.snakeHead
    } else {
      ctx.fillStyle = themeColors.snake
    }

    ctx.fillRect(segment.x, segment.y, CELL_SIZE, CELL_SIZE)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a

    // Add eyes to head
    if (i === 0) {
      ctx.fillStyle = "#000000"

      // Position eyes based on direction
<<<<<<< HEAD
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
=======
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
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
          break
      }
    }
  }

  // Draw food
<<<<<<< HEAD
  ctx.fillStyle = colors.food
=======
  ctx.fillStyle = themeColors.food
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
  ctx.beginPath()
  ctx.arc(food.x + CELL_SIZE / 2, food.y + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw obstacles
<<<<<<< HEAD
  ctx.fillStyle = colors.obstacle
  for (const obstacle of obstacles) {
=======
  ctx.fillStyle = themeColors.obstacle
  for (const obstacle of obstacles) {
    // Draw rock-like obstacle
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
    ctx.beginPath()
    ctx.moveTo(obstacle.x, obstacle.y + CELL_SIZE)
    ctx.lineTo(obstacle.x + CELL_SIZE / 3, obstacle.y + CELL_SIZE / 3)
    ctx.lineTo(obstacle.x + CELL_SIZE, obstacle.y + CELL_SIZE / 2)
    ctx.lineTo(obstacle.x + CELL_SIZE * 0.8, obstacle.y + CELL_SIZE)
    ctx.fill()
  }

  // Draw villagers
<<<<<<< HEAD
  ctx.fillStyle = colors.villager
  for (const villager of villagers) {
=======
  ctx.fillStyle = themeColors.villager
  for (const villager of villagers) {
    // Draw villager (simple person shape)
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
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

<<<<<<< HEAD
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
=======
function updateScoreDisplay() {
  document.getElementById("score-display").textContent = `Score: ${score}`
}

function updateLevelDisplay() {
  document.getElementById("level-display").textContent = `Level: ${level}`
>>>>>>> a76ec0f5241cf8659c264bea9198ff52a98a535a
}
