"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGameContext } from "@/context/game-context"
import GameControls from "./game-controls"
import { Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react"

interface GameScreenProps {
  onMenuClick: () => void
  onGameOver: (score: number, level: number) => void
}

// Game constants
const CELL_SIZE = 20
const INITIAL_SPEED = 150
const SPEED_INCREASE = 5
const LEVEL_THRESHOLD = 5
const MAX_LEVEL = 15 // Increased to 15 levels
const DANGER_DISTANCE = 3 // Cells distance to trigger danger mode

type Direction = "up" | "down" | "left" | "right"
type Position = { x: number; y: number }
type Particle = { x: number; y: number; size: number; color: string; vx: number; vy: number; life: number }
type Prop = { x: number; y: number; type: string; theme: string }
type Villager = Position & { scared: boolean; runDirection?: Direction }

export default function GameScreen({ onMenuClick, onGameOver }: GameScreenProps) {
  const { settings } = useGameContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [inDanger, setInDanger] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 })
  const [isEating, setIsEating] = useState(false)
  const [props, setProps] = useState<Prop[]>([])
  const [soundMuted, setSoundMuted] = useState(!settings.soundEnabled)
  const [snake, setSnake] = useState<Position[]>([
    { x: 3 * CELL_SIZE, y: 10 * CELL_SIZE },
    { x: 2 * CELL_SIZE, y: 10 * CELL_SIZE },
    { x: 1 * CELL_SIZE, y: 10 * CELL_SIZE },
  ])
  const [food, setFood] = useState<Position>({ x: 0, y: 0 })
  const [obstacles, setObstacles] = useState<Position[]>([])
  const [villagers, setVillagers] = useState<Villager[]>([])
  const [direction, setDirection] = useState<Direction>("right")
  const [nextDirection, setNextDirection] = useState<Direction>("right")
  const [foodEatenInLevel, setFoodEatenInLevel] = useState(0)
  const [gameSpeed, setGameSpeed] = useState(
    INITIAL_SPEED -
      (settings.difficulty === "easy"
        ? 50
        : settings.difficulty === "hard"
          ? -50
          : settings.difficulty === "extreme"
            ? -100
            : 0),
  )

  // Sound effects
  const eatSoundRef = useRef<HTMLAudioElement | null>(null)
  const dangerSoundRef = useRef<HTMLAudioElement | null>(null)
  const levelUpSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null)
  const screamSoundRef = useRef<HTMLAudioElement | null>(null)
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null)

  // Theme colors and properties
  const themes = {
    forest: {
      background: "#232931",
      snake: "#4ecca3",
      snakeHead: "#2e8b57",
      food: "#ff6b6b",
      obstacle: "#a0522d",
      villager: "#ffd700",
      border: "#4ecca3",
      particle: "#4ecca3",
      props: ["tree", "bush", "rock", "flower"],
      villageProps: ["house", "well", "fence"],
    },
    desert: {
      background: "#e6ccb2",
      snake: "#e67e22",
      snakeHead: "#d35400",
      food: "#3498db",
      obstacle: "#7f5539",
      villager: "#f4d03f",
      border: "#d35400",
      particle: "#e67e22",
      props: ["cactus", "bone", "dune", "skull"],
      villageProps: ["tent", "oasis", "camel"],
    },
    snow: {
      background: "#ecf0f1",
      snake: "#3498db",
      snakeHead: "#2980b9",
      food: "#e74c3c",
      obstacle: "#7f8c8d",
      villager: "#bdc3c7",
      border: "#3498db",
      particle: "#3498db",
      props: ["pine", "snowman", "ice", "crystal"],
      villageProps: ["cabin", "igloo", "sled"],
    },
    neon: {
      background: "#000000",
      snake: "#39ff14",
      snakeHead: "#00ff00",
      food: "#ff00ff",
      obstacle: "#4b0082",
      villager: "#00ffff",
      border: "#ff00ff",
      particle: "#39ff14",
      props: ["neonSign", "arcade", "lightPost", "hologram"],
      villageProps: ["nightclub", "casino", "hotel"],
    },
    cyberpunk: {
      background: "#0d0221",
      snake: "#ff00ff",
      snakeHead: "#d600d6",
      food: "#00ffff",
      obstacle: "#ff6b35",
      villager: "#fffc31",
      border: "#ff00ff",
      particle: "#00ffff",
      props: ["server", "drone", "terminal", "robot"],
      villageProps: ["techBuilding", "antenna", "powerPlant"],
    },
    underwater: {
      background: "#0a2463",
      snake: "#3e92cc",
      snakeHead: "#2e78b7",
      food: "#ff5a5f",
      obstacle: "#5e503f",
      villager: "#c6dabf",
      border: "#3e92cc",
      particle: "#3e92cc",
      props: ["coral", "seaweed", "shell", "treasure"],
      villageProps: ["shipwreck", "submarine", "ruins"],
    },
    lava: {
      background: "#300313",
      snake: "#ff6b35",
      snakeHead: "#f03800",
      food: "#ffe74c",
      obstacle: "#6a0572",
      villager: "#fffc31",
      border: "#ff6b35",
      particle: "#ff6b35",
      props: ["volcano", "magma", "obsidian", "ember"],
      villageProps: ["forge", "mine", "hut"],
    },
    space: {
      background: "#0a0a23",
      snake: "#7400b8",
      snakeHead: "#5e00a3",
      food: "#80ffdb",
      obstacle: "#6930c3",
      villager: "#48bfe3",
      border: "#7400b8",
      particle: "#80ffdb",
      props: ["asteroid", "satellite", "comet", "planet"],
      villageProps: ["spaceStation", "observatory", "rocket"],
    },
  }

  // Initialize game
  useEffect(() => {
    // Initialize audio elements
    eatSoundRef.current = new Audio("/sounds/eat.mp3")
    dangerSoundRef.current = new Audio("/sounds/danger.mp3")
    levelUpSoundRef.current = new Audio("/sounds/levelup.mp3")
    gameOverSoundRef.current = new Audio("/sounds/gameover.mp3")
    screamSoundRef.current = new Audio("/sounds/scream.mp3")
    ambientSoundRef.current = new Audio("/sounds/ambient.mp3")

    if (ambientSoundRef.current) {
      ambientSoundRef.current.loop = true
      ambientSoundRef.current.volume = 0.3
      if (!soundMuted) {
        ambientSoundRef.current.play().catch((e) => console.error("Error playing ambient sound:", e))
      }
    }

    // Set initial canvas size based on container
    updateCanvasSize()

    // Place initial food
    placeFood()

    // Add initial props
    addProps()

    // Handle keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to avoid page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case "ArrowUp":
          changeDirection("up")
          break
        case "ArrowDown":
          changeDirection("down")
          break
        case "ArrowLeft":
          changeDirection("left")
          break
        case "ArrowRight":
          changeDirection("right")
          break
        case "p":
        case "P":
          togglePause()
          break
        case "m":
        case "M":
          onMenuClick()
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
        case "s":
        case "S":
          toggleSound()
          break
      }
    }

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)

      // Clean up audio
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause()
        ambientSoundRef.current.currentTime = 0
      }
    }
  }, [])

  // Update sound mute state when settings change
  useEffect(() => {
    setSoundMuted(!settings.soundEnabled)

    if (ambientSoundRef.current) {
      if (settings.soundEnabled) {
        ambientSoundRef.current.play().catch((e) => console.error("Error playing ambient sound:", e))
      } else {
        ambientSoundRef.current.pause()
      }
    }
  }, [settings.soundEnabled])

  // Update canvas size based on container
  const updateCanvasSize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = window.innerHeight * 0.7

      // Make sure the canvas is a multiple of CELL_SIZE
      const width = Math.floor(containerWidth / CELL_SIZE) * CELL_SIZE
      const height = Math.floor(containerHeight / CELL_SIZE) * CELL_SIZE

      setCanvasSize({ width, height })
    }
  }

  // Game loop
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(updateGame, gameSpeed)
      return () => clearInterval(interval)
    }
  }, [snake, food, obstacles, villagers, direction, nextDirection, isPaused, gameSpeed, canvasSize])

  // Draw game
  useEffect(() => {
    drawGame()
  }, [snake, food, obstacles, villagers, settings.theme, inDanger, particles, canvasSize, isEating, props])

  // Check for danger
  useEffect(() => {
    checkDanger()
  }, [snake, obstacles, villagers, canvasSize])

  // Update particles
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setInterval(() => {
        updateParticles()
      }, 50)
      return () => clearInterval(timer)
    }
  }, [particles])

  // Reset eating animation
  useEffect(() => {
    if (isEating) {
      const timer = setTimeout(() => {
        setIsEating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isEating])

  function updateGame() {
    // Update direction
    setDirection(nextDirection)

    // Move snake
    moveSnake()

    // Move villagers in higher levels
    if (level >= 2) {
      moveVillagers()
    }

    // Check for collisions
    if (checkCollision()) {
      if (!soundMuted && gameOverSoundRef.current) {
        gameOverSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
      }
      onGameOver(score, level)
      return
    }

    // Check if food eaten
    checkFood()
  }

  function moveSnake() {
    const head = { ...snake[0] }

    // Move head based on direction
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
    if (head.x < 0) head.x = canvasSize.width - CELL_SIZE
    if (head.x >= canvasSize.width) head.x = 0
    if (head.y < 0) head.y = canvasSize.height - CELL_SIZE
    if (head.y >= canvasSize.height) head.y = 0

    // Create new snake with new head
    const newSnake = [head, ...snake]

    // Remove tail unless food was eaten
    if (head.x !== food.x || head.y !== food.y) {
      newSnake.pop()
    }

    setSnake(newSnake)
  }

  function moveVillagers() {
    setVillagers((prevVillagers) => {
      return prevVillagers.map((villager) => {
        // Villagers try to move away from snake head
        const head = snake[0]
        const distX = head.x - villager.x
        const distY = head.y - villager.y
        const distance = Math.sqrt(distX * distX + distY * distY)

        // Set scared state based on distance to snake
        const scared = distance < CELL_SIZE * 5

        // Determine direction to move (away from snake)
        let moveX = 0
        let moveY = 0
        let runDirection: Direction | undefined = villager.runDirection

        if (scared) {
          // If scared, run away from snake
          if (Math.abs(distX) > Math.abs(distY)) {
            // Move horizontally
            moveX = distX > 0 ? -CELL_SIZE : CELL_SIZE
            runDirection = distX > 0 ? "left" : "right"
          } else {
            // Move vertically
            moveY = distY > 0 ? -CELL_SIZE : CELL_SIZE
            runDirection = distY > 0 ? "up" : "down"
          }
        } else if (Math.random() < 0.1) {
          // Occasionally move randomly when not scared
          const directions: Direction[] = ["up", "down", "left", "right"]
          runDirection = directions[Math.floor(Math.random() * directions.length)]

          switch (runDirection) {
            case "up":
              moveY = -CELL_SIZE
              break
            case "down":
              moveY = CELL_SIZE
              break
            case "left":
              moveX = -CELL_SIZE
              break
            case "right":
              moveX = CELL_SIZE
              break
          }
        }

        // Only move if new position is valid
        const newX = villager.x + moveX
        const newY = villager.y + moveY

        if (
          newX >= 0 &&
          newX < canvasSize.width &&
          newY >= 0 &&
          newY < canvasSize.height &&
          isValidPosition(newX, newY)
        ) {
          return { x: newX, y: newY, scared, runDirection }
        }

        return { ...villager, scared }
      })
    })
  }

  function checkCollision() {
    const head = snake[0]

    // Check collision with self (only check body segments, not the head)
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

    // No collision with villagers - they should not cause game over
    return false
  }

  function checkDanger() {
    const head = snake[0]
    let danger = false

    // Check proximity to walls if not wrapping
    if (
      head.x <= CELL_SIZE * DANGER_DISTANCE ||
      head.x >= canvasSize.width - CELL_SIZE * DANGER_DISTANCE ||
      head.y <= CELL_SIZE * DANGER_DISTANCE ||
      head.y >= canvasSize.height - CELL_SIZE * DANGER_DISTANCE
    ) {
      danger = true
    }

    // Check proximity to self
    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i]
      const distance = Math.sqrt(
        Math.pow((head.x - segment.x) / CELL_SIZE, 2) + Math.pow((head.y - segment.y) / CELL_SIZE, 2),
      )

      if (distance <= DANGER_DISTANCE && distance > 1) {
        danger = true
        break
      }
    }

    // Check proximity to obstacles
    for (const obstacle of obstacles) {
      const distance = Math.sqrt(
        Math.pow((head.x - obstacle.x) / CELL_SIZE, 2) + Math.pow((head.y - obstacle.y) / CELL_SIZE, 2),
      )

      if (distance <= DANGER_DISTANCE) {
        danger = true
        break
      }
    }

    // Play danger sound if newly in danger
    if (danger && !inDanger && !soundMuted && dangerSoundRef.current) {
      dangerSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }

    setInDanger(danger)
  }

  function checkFood() {
    const head = snake[0]

    if (head.x === food.x && head.y === food.y) {
      // Set eating animation
      setIsEating(true)

      // Increase score
      const newScore = score + level * 10
      setScore(newScore)

      // Play eat sound
      if (!soundMuted) {
        if (eatSoundRef.current) {
          eatSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
        }

        // Play scream sound occasionally
        if (screamSoundRef.current && Math.random() < 0.5) {
          screamSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
        }
      }

      // Create particles at food location
      if (settings.particleEffects) {
        createParticles(food.x + CELL_SIZE / 2, food.y + CELL_SIZE / 2)
      }

      // Place new food
      placeFood()

      // Increase speed slightly
      const newSpeed = Math.max(50, gameSpeed - SPEED_INCREASE)
      setGameSpeed(newSpeed)

      // Track food eaten in level
      const newFoodEaten = foodEatenInLevel + 1
      setFoodEatenInLevel(newFoodEaten)

      // Check for level up
      if (newFoodEaten >= LEVEL_THRESHOLD && level < MAX_LEVEL) {
        levelUp()
      }
    }
  }

  function levelUp() {
    const newLevel = level + 1
    setLevel(newLevel)
    setFoodEatenInLevel(0)

    // Play level up sound
    if (!soundMuted && levelUpSoundRef.current) {
      levelUpSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }

    // Show level up notification
    setShowLevelUp(true)
    setTimeout(() => setShowLevelUp(false), 2000)

    // Add obstacles based on level
    addObstacles(newLevel)

    // Add villagers in higher levels
    if (newLevel >= 2) {
      addVillagers(newLevel)
    }

    // Add more props as levels increase
    addProps()
  }

  function placeFood() {
    let validPosition = false
    let newFood = { x: 0, y: 0 }
    let attempts = 0
    const maxAttempts = 100 // Prevent infinite loop

    while (!validPosition && attempts < maxAttempts) {
      newFood = {
        x: Math.floor(Math.random() * (canvasSize.width / CELL_SIZE)) * CELL_SIZE,
        y: Math.floor(Math.random() * (canvasSize.height / CELL_SIZE)) * CELL_SIZE,
      }

      validPosition = isValidPosition(newFood.x, newFood.y)
      attempts++
    }

    // If we couldn't find a valid position after max attempts, place food in a safe position
    if (!validPosition) {
      // Find a position far from the snake
      const head = snake[0]
      for (let x = 0; x < canvasSize.width; x += CELL_SIZE) {
        for (let y = 0; y < canvasSize.height; y += CELL_SIZE) {
          const distToHead = Math.sqrt(Math.pow(x - head.x, 2) + Math.pow(y - head.y, 2))
          if (distToHead > CELL_SIZE * 5 && isValidPosition(x, y)) {
            newFood = { x, y }
            validPosition = true
            break
          }
        }
        if (validPosition) break
      }
    }

    setFood(newFood)
  }

  function addObstacles(currentLevel: number) {
    const newObstacles: Position[] = []
    const numObstacles = currentLevel * 2

    for (let i = 0; i < numObstacles; i++) {
      let validPosition = false
      let position = { x: 0, y: 0 }
      let attempts = 0
      const maxAttempts = 50

      while (!validPosition && attempts < maxAttempts) {
        position = {
          x: Math.floor(Math.random() * (canvasSize.width / CELL_SIZE)) * CELL_SIZE,
          y: Math.floor(Math.random() * (canvasSize.height / CELL_SIZE)) * CELL_SIZE,
        }

        // Make sure obstacles are not placed too close to the snake head
        const head = snake[0]
        const distToHead = Math.sqrt(Math.pow(position.x - head.x, 2) + Math.pow(position.y - head.y, 2))

        validPosition = distToHead > CELL_SIZE * 5 && isValidPosition(position.x, position.y)
        attempts++
      }

      if (validPosition) {
        newObstacles.push(position)
      }
    }

    setObstacles(newObstacles)
  }

  function addVillagers(currentLevel: number) {
    const newVillagers: Villager[] = []
    const numVillagers = Math.min(currentLevel, 10) // Cap at 10 villagers max

    for (let i = 0; i < numVillagers; i++) {
      let validPosition = false
      let position = { x: 0, y: 0 }
      let attempts = 0
      const maxAttempts = 50

      while (!validPosition && attempts < maxAttempts) {
        position = {
          x: Math.floor(Math.random() * (canvasSize.width / CELL_SIZE)) * CELL_SIZE,
          y: Math.floor(Math.random() * (canvasSize.height / CELL_SIZE)) * CELL_SIZE,
        }

        // Make sure villagers are placed away from snake
        let tooClose = false
        for (const segment of snake) {
          const distance = Math.sqrt(Math.pow(segment.x - position.x, 2) + Math.pow(segment.y - position.y, 2))
          if (distance < 5 * CELL_SIZE) {
            tooClose = true
            break
          }
        }

        validPosition = !tooClose && isValidPosition(position.x, position.y)
        attempts++
      }

      if (validPosition) {
        newVillagers.push({ ...position, scared: false })
      }
    }

    setVillagers(newVillagers)
  }

  function addProps() {
    const themeData = themes[settings.theme as keyof typeof themes]
    const newProps: Prop[] = []

    // Add decorative props
    const numProps = 10 + level * 2 // More props as levels increase
    const propTypes = [...themeData.props]

    // Add village props in higher levels
    if (level >= 3) {
      propTypes.push(...themeData.villageProps)
    }

    for (let i = 0; i < numProps; i++) {
      let validPosition = false
      let position = { x: 0, y: 0 }
      let attempts = 0
      const maxAttempts = 30

      while (!validPosition && attempts < maxAttempts) {
        position = {
          x: Math.floor(Math.random() * (canvasSize.width / CELL_SIZE)) * CELL_SIZE,
          y: Math.floor(Math.random() * (canvasSize.height / CELL_SIZE)) * CELL_SIZE,
        }

        // Make sure props are not placed on game elements
        validPosition = isValidPropPosition(position.x, position.y)
        attempts++
      }

      if (validPosition) {
        const propType = propTypes[Math.floor(Math.random() * propTypes.length)]
        newProps.push({ ...position, type: propType, theme: settings.theme })
      }
    }

    setProps(newProps)
  }

  function isValidPosition(x: number, y: number) {
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

  function isValidPropPosition(x: number, y: number) {
    // First check if position is valid for game elements
    if (!isValidPosition(x, y)) {
      return false
    }

    // Also check if position is occupied by another prop
    for (const prop of props) {
      if (prop.x === x && prop.y === y) {
        return false
      }
    }

    return true
  }

  function createParticles(x: number, y: number) {
    const themeColors = themes[settings.theme as keyof typeof themes]
    const newParticles: Particle[] = []

    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 3

      newParticles.push({
        x,
        y,
        size: 2 + Math.random() * 4,
        color: themeColors.particle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }

  function updateParticles() {
    setParticles((prevParticles) =>
      prevParticles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1,
          size: p.size * 0.95,
        }))
        .filter((p) => p.life > 0),
    )
  }

  function drawGame() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const colors = themes[settings.theme as keyof typeof themes]

    // Clear canvas
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw theme-specific background elements
    drawThemeBackground(ctx, settings.theme, canvas.width, canvas.height)

    // Draw props (behind game elements)
    drawProps(ctx)

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
      // For the head
      if (i === 0) {
        ctx.fillStyle = colors.snakeHead
        ctx.beginPath()

        // Draw rounded rectangle for head
        const radius = CELL_SIZE / 4

        if (isEating) {
          // Draw open mouth when eating
          switch (direction) {
            case "right":
              // Body
              ctx.beginPath()
              ctx.roundRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE, radius)
              ctx.fill()

              // Open mouth
              ctx.fillStyle = "#000000"
              ctx.beginPath()
              ctx.moveTo(snake[i].x + CELL_SIZE, snake[i].y + CELL_SIZE / 4)
              ctx.lineTo(snake[i].x + CELL_SIZE + CELL_SIZE / 3, snake[i].y + CELL_SIZE / 2)
              ctx.lineTo(snake[i].x + CELL_SIZE, snake[i].y + (CELL_SIZE * 3) / 4)
              ctx.fill()

              // Eyes
              ctx.fillRect(snake[i].x + CELL_SIZE - 7, snake[i].y + 5, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 7, snake[i].y + CELL_SIZE - 9, 4, 4)
              break

            case "left":
              // Body
              ctx.beginPath()
              ctx.roundRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE, radius)
              ctx.fill()

              // Open mouth
              ctx.fillStyle = "#000000"
              ctx.beginPath()
              ctx.moveTo(snake[i].x, snake[i].y + CELL_SIZE / 4)
              ctx.lineTo(snake[i].x - CELL_SIZE / 3, snake[i].y + CELL_SIZE / 2)
              ctx.lineTo(snake[i].x, snake[i].y + (CELL_SIZE * 3) / 4)
              ctx.fill()

              // Eyes
              ctx.fillRect(snake[i].x + 3, snake[i].y + 5, 4, 4)
              ctx.fillRect(snake[i].x + 3, snake[i].y + CELL_SIZE - 9, 4, 4)
              break

            case "up":
              // Body
              ctx.beginPath()
              ctx.roundRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE, radius)
              ctx.fill()

              // Open mouth
              ctx.fillStyle = "#000000"
              ctx.beginPath()
              ctx.moveTo(snake[i].x + CELL_SIZE / 4, snake[i].y)
              ctx.lineTo(snake[i].x + CELL_SIZE / 2, snake[i].y - CELL_SIZE / 3)
              ctx.lineTo(snake[i].x + (CELL_SIZE * 3) / 4, snake[i].y)
              ctx.fill()

              // Eyes
              ctx.fillRect(snake[i].x + 5, snake[i].y + 3, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 9, snake[i].y + 3, 4, 4)
              break

            case "down":
              // Body
              ctx.beginPath()
              ctx.roundRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE, radius)
              ctx.fill()

              // Open mouth
              ctx.fillStyle = "#000000"
              ctx.beginPath()
              ctx.moveTo(snake[i].x + CELL_SIZE / 4, snake[i].y + CELL_SIZE)
              ctx.lineTo(snake[i].x + CELL_SIZE / 2, snake[i].y + CELL_SIZE + CELL_SIZE / 3)
              ctx.lineTo(snake[i].x + (CELL_SIZE * 3) / 4, snake[i].y + CELL_SIZE)
              ctx.fill()

              // Eyes
              ctx.fillRect(snake[i].x + 5, snake[i].y + CELL_SIZE - 7, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 9, snake[i].y + CELL_SIZE - 7, 4, 4)
              break
          }
        } else {
          // Normal head (not eating)
          ctx.moveTo(snake[i].x + radius, snake[i].y)
          ctx.lineTo(snake[i].x + CELL_SIZE - radius, snake[i].y)
          ctx.quadraticCurveTo(snake[i].x + CELL_SIZE, snake[i].y, snake[i].x + CELL_SIZE, snake[i].y + radius)
          ctx.lineTo(snake[i].x + CELL_SIZE, snake[i].y + CELL_SIZE - radius)
          ctx.quadraticCurveTo(
            snake[i].x + CELL_SIZE,
            snake[i].y + CELL_SIZE,
            snake[i].x + CELL_SIZE - radius,
            snake[i].y + CELL_SIZE,
          )
          ctx.lineTo(snake[i].x + radius, snake[i].y + CELL_SIZE)
          ctx.quadraticCurveTo(snake[i].x, snake[i].y + CELL_SIZE, snake[i].x, snake[i].y + CELL_SIZE - radius)
          ctx.lineTo(snake[i].x, snake[i].y + radius)
          ctx.quadraticCurveTo(snake[i].x, snake[i].y, snake[i].x + radius, snake[i].y)
          ctx.fill()

          // Add eyes to head
          ctx.fillStyle = "#000000"

          // Position eyes based on direction
          switch (direction) {
            case "up":
              ctx.fillRect(snake[i].x + 5, snake[i].y + 3, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 9, snake[i].y + 3, 4, 4)
              break
            case "down":
              ctx.fillRect(snake[i].x + 5, snake[i].y + CELL_SIZE - 7, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 9, snake[i].y + CELL_SIZE - 7, 4, 4)
              break
            case "left":
              ctx.fillRect(snake[i].x + 3, snake[i].y + 5, 4, 4)
              ctx.fillRect(snake[i].x + 3, snake[i].y + CELL_SIZE - 9, 4, 4)
              break
            case "right":
              ctx.fillRect(snake[i].x + CELL_SIZE - 7, snake[i].y + 5, 4, 4)
              ctx.fillRect(snake[i].x + CELL_SIZE - 7, snake[i].y + CELL_SIZE - 9, 4, 4)
              break
          }
        }
      } else {
        // For body segments
        ctx.fillStyle = colors.snake

        // Draw rounded body segments
        ctx.beginPath()
        const radius = CELL_SIZE / 5

        // Connect segments smoothly
        if (i < snake.length - 1) {
          const prev = snake[i - 1]
          const current = snake[i]
          const next = snake[i + 1]

          // Calculate direction to previous and next segments
          const dirToPrev = {
            x: prev.x - current.x,
            y: prev.y - current.y,
          }

          const dirToNext = {
            x: next.x - current.x,
            y: next.y - current.y,
          }

          // Draw rounded rectangle with direction-based rounding
          ctx.beginPath()
          ctx.roundRect(current.x, current.y, CELL_SIZE, CELL_SIZE, radius)
          ctx.fill()
        } else {
          // Tail segment
          ctx.beginPath()
          ctx.roundRect(snake[i].x, snake[i].y, CELL_SIZE, CELL_SIZE, radius)
          ctx.fill()
        }
      }
    }

    // Draw villagers (instead of food)
    for (const villager of villagers) {
      // Draw villager
      ctx.fillStyle = colors.villager

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

      // Face - scared or normal
      ctx.fillStyle = "#000000"
      if (villager.scared) {
        // Scared face - wide eyes and open mouth
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.4, villager.y + CELL_SIZE * 0.3, CELL_SIZE * 0.06, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.6, villager.y + CELL_SIZE * 0.3, CELL_SIZE * 0.06, 0, Math.PI * 2)
        ctx.fill()

        // Open mouth
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.5, villager.y + CELL_SIZE * 0.4, CELL_SIZE * 0.08, 0, Math.PI, false)
        ctx.fill()
      } else {
        // Normal face
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.45, villager.y + CELL_SIZE * 0.3, CELL_SIZE * 0.05, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.55, villager.y + CELL_SIZE * 0.3, CELL_SIZE * 0.05, 0, Math.PI * 2)
        ctx.fill()

        // Smile
        ctx.beginPath()
        ctx.arc(villager.x + CELL_SIZE * 0.5, villager.y + CELL_SIZE * 0.35, CELL_SIZE * 0.07, 0, Math.PI, false)
        ctx.stroke()
      }
    }

    // Draw food as a scared villager
    ctx.fillStyle = colors.food

    // Head
    ctx.beginPath()
    ctx.arc(food.x + CELL_SIZE / 2, food.y + CELL_SIZE / 3, CELL_SIZE / 4, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillRect(food.x + CELL_SIZE * 0.4, food.y + CELL_SIZE / 3, CELL_SIZE * 0.2, CELL_SIZE * 0.5)

    // Arms - waving in panic
    const armWave = Math.sin(Date.now() / 100) * 0.2
    ctx.fillRect(food.x + CELL_SIZE * 0.2, food.y + CELL_SIZE * (0.5 - armWave), CELL_SIZE * 0.2, CELL_SIZE * 0.1)
    ctx.fillRect(food.x + CELL_SIZE * 0.6, food.y + CELL_SIZE * (0.5 + armWave), CELL_SIZE * 0.2, CELL_SIZE * 0.1)

    // Legs - running motion
    const legOffset = Math.sin(Date.now() / 150) * 0.1
    ctx.fillRect(food.x + CELL_SIZE * 0.3, food.y + CELL_SIZE * (0.7 - legOffset), CELL_SIZE * 0.1, CELL_SIZE * 0.3)
    ctx.fillRect(food.x + CELL_SIZE * 0.6, food.y + CELL_SIZE * (0.7 + legOffset), CELL_SIZE * 0.1, CELL_SIZE * 0.3)

    // Scared face
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(food.x + CELL_SIZE * 0.4, food.y + CELL_SIZE * 0.3, CELL_SIZE * 0.06, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(food.x + CELL_SIZE * 0.6, food.y + CELL_SIZE * 0.3, CELL_SIZE * 0.06, 0, Math.PI * 2)
    ctx.fill()

    // Open mouth
    ctx.beginPath()
    ctx.arc(food.x + CELL_SIZE * 0.5, food.y + CELL_SIZE * 0.4, CELL_SIZE * 0.08, 0, Math.PI, false)
    ctx.fill()

    // Draw obstacles
    ctx.fillStyle = colors.obstacle
    for (const obstacle of obstacles) {
      // Draw rock-like obstacle
      ctx.beginPath()
      ctx.moveTo(obstacle.x, obstacle.y + CELL_SIZE)
      ctx.lineTo(obstacle.x + CELL_SIZE / 3, obstacle.y + CELL_SIZE / 3)
      ctx.lineTo(obstacle.x + CELL_SIZE, obstacle.y + CELL_SIZE / 2)
      ctx.lineTo(obstacle.x + CELL_SIZE * 0.8, obstacle.y + CELL_SIZE)
      ctx.fill()

      // Add texture to obstacles
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.beginPath()
      ctx.arc(obstacle.x + CELL_SIZE * 0.3, obstacle.y + CELL_SIZE * 0.6, CELL_SIZE * 0.1, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = colors.obstacle
    }

    // Draw particles
    for (const particle of particles) {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life / 50
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }

  function drawProps(ctx: CanvasRenderingContext2D) {
    for (const prop of props) {
      switch (prop.type) {
        // Forest props
        case "tree":
          drawTree(ctx, prop.x, prop.y)
          break
        case "bush":
          drawBush(ctx, prop.x, prop.y)
          break
        case "rock":
          drawRock(ctx, prop.x, prop.y)
          break
        case "flower":
          drawFlower(ctx, prop.x, prop.y)
          break
        case "house":
          drawHouse(ctx, prop.x, prop.y)
          break
        case "well":
          drawWell(ctx, prop.x, prop.y)
          break
        case "fence":
          drawFence(ctx, prop.x, prop.y)
          break

        // Desert props
        case "cactus":
          drawCactus(ctx, prop.x, prop.y)
          break
        case "bone":
          drawBone(ctx, prop.x, prop.y)
          break
        case "dune":
          drawDune(ctx, prop.x, prop.y)
          break
        case "skull":
          drawSkull(ctx, prop.x, prop.y)
          break
        case "tent":
          drawTent(ctx, prop.x, prop.y)
          break
        case "oasis":
          drawOasis(ctx, prop.x, prop.y)
          break
        case "camel":
          drawCamel(ctx, prop.x, prop.y)
          break

        // Snow props
        case "pine":
          drawPine(ctx, prop.x, prop.y)
          break
        case "snowman":
          drawSnowman(ctx, prop.x, prop.y)
          break
        case "ice":
          drawIce(ctx, prop.x, prop.y)
          break
        case "crystal":
          drawCrystal(ctx, prop.x, prop.y)
          break
        case "cabin":
          drawCabin(ctx, prop.x, prop.y)
          break
        case "igloo":
          drawIgloo(ctx, prop.x, prop.y)
          break
        case "sled":
          drawSled(ctx, prop.x, prop.y)
          break

        // Other theme props
        default:
          drawGenericProp(ctx, prop.x, prop.y, prop.type, prop.theme)
          break
      }
    }
  }

  // Prop drawing functions
  function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Trunk
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.5, CELL_SIZE * 0.2, CELL_SIZE * 0.5)

    // Leaves
    ctx.fillStyle = "#2e8b57"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.3, CELL_SIZE * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#3a5f0b"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.5, CELL_SIZE * 0.3, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.5, CELL_SIZE * 0.3, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.3, CELL_SIZE * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#7f7f7f"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.6, CELL_SIZE * 0.4, CELL_SIZE * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Highlight
    ctx.fillStyle = "#a0a0a0"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.5, CELL_SIZE * 0.1, CELL_SIZE * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Stem
    ctx.fillStyle = "#3a5f0b"
    ctx.fillRect(x + CELL_SIZE * 0.45, y + CELL_SIZE * 0.4, CELL_SIZE * 0.1, CELL_SIZE * 0.6)

    // Petals
    ctx.fillStyle = "#ff69b4"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.3, CELL_SIZE * 0.2, 0, Math.PI * 2)
    ctx.fill()

    // Center
    ctx.fillStyle = "#ffff00"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.3, CELL_SIZE * 0.1, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawHouse(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Base
    ctx.fillStyle = "#cd8500"
    ctx.fillRect(x, y + CELL_SIZE * 0.4, CELL_SIZE, CELL_SIZE * 0.6)

    // Roof
    ctx.fillStyle = "#8B4513"
    ctx.beginPath()
    ctx.moveTo(x - CELL_SIZE * 0.1, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.5, y)
    ctx.lineTo(x + CELL_SIZE * 1.1, y + CELL_SIZE * 0.4)
    ctx.fill()

    // Door
    ctx.fillStyle = "#5c3c10"
    ctx.fillRect(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.6, CELL_SIZE * 0.2, CELL_SIZE * 0.4)

    // Window
    ctx.fillStyle = "#87ceeb"
    ctx.fillRect(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.5, CELL_SIZE * 0.15, CELL_SIZE * 0.15)
    ctx.fillRect(x + CELL_SIZE * 0.65, y + CELL_SIZE * 0.5, CELL_SIZE * 0.15, CELL_SIZE * 0.15)
  }

  function drawWell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Base
    ctx.fillStyle = "#7f7f7f"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.4, 0, Math.PI * 2)
    ctx.fill()

    // Inner circle
    ctx.fillStyle = "#0a2463"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.25, 0, Math.PI * 2)
    ctx.fill()

    // Roof supports
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.2, CELL_SIZE * 0.1, CELL_SIZE * 0.3)
    ctx.fillRect(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.2, CELL_SIZE * 0.1, CELL_SIZE * 0.3)

    // Roof
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.5, y)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.2)
    ctx.fill()
  }

  function drawFence(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#8B4513"

    // Vertical posts
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + CELL_SIZE * 0.1 + i * CELL_SIZE * 0.2, y + CELL_SIZE * 0.3, CELL_SIZE * 0.1, CELL_SIZE * 0.7)
    }

    // Horizontal bars
    ctx.fillRect(x, y + CELL_SIZE * 0.4, CELL_SIZE, CELL_SIZE * 0.1)
    ctx.fillRect(x, y + CELL_SIZE * 0.7, CELL_SIZE, CELL_SIZE * 0.1)
  }

  // Generic prop for other themes
  function drawGenericProp(ctx: CanvasRenderingContext2D, x: number, y: number, type: string, theme: string) {
    const colors = themes[theme as keyof typeof themes]

    // Draw a simple shape based on the theme
    ctx.fillStyle = colors.obstacle
    ctx.beginPath()
    ctx.roundRect(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.1, CELL_SIZE * 0.8, CELL_SIZE * 0.8, CELL_SIZE * 0.2)
    ctx.fill()

    // Add some detail
    ctx.fillStyle = colors.villager
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Desert props
  function drawCactus(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#2e8b57"

    // Main body
    ctx.fillRect(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.2, CELL_SIZE * 0.2, CELL_SIZE * 0.8)

    // Arms
    ctx.fillRect(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.4, CELL_SIZE * 0.5, CELL_SIZE * 0.15)
    ctx.fillRect(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.3, CELL_SIZE * 0.3, CELL_SIZE * 0.15)
  }

  function drawBone(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#f5f5f5"

    // Bone ends
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.3, CELL_SIZE * 0.15, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.7, CELL_SIZE * 0.15, 0, Math.PI * 2)
    ctx.fill()

    // Bone shaft
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.6)
    ctx.lineWidth = CELL_SIZE * 0.1
    ctx.strokeStyle = "#f5f5f5"
    ctx.stroke()
  }

  function drawDune(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#e6ccb2"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.7, CELL_SIZE * 0.5, CELL_SIZE * 0.3, 0, 0, Math.PI)
    ctx.fill()

    // Highlight
    ctx.fillStyle = "#d4bc9c"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.6, CELL_SIZE * 0.2, CELL_SIZE * 0.1, 0, 0, Math.PI)
    ctx.fill()
  }

  function drawSkull(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#f5f5f5"

    // Skull
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.4, CELL_SIZE * 0.3, 0, Math.PI * 2)
    ctx.fill()

    // Eyes
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.35, CELL_SIZE * 0.08, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.6, y + CELL_SIZE * 0.35, CELL_SIZE * 0.08, 0, Math.PI * 2)
    ctx.fill()

    // Jaw
    ctx.fillStyle = "#f5f5f5"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.6, CELL_SIZE * 0.2, CELL_SIZE * 0.1, 0, 0, Math.PI)
    ctx.fill()
  }

  function drawTent(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#cd8500"

    // Tent
    ctx.beginPath()
    ctx.moveTo(x, y + CELL_SIZE)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE)
    ctx.fill()

    // Entrance
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.6)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.6, y + CELL_SIZE * 0.6)
    ctx.fill()
  }

  function drawOasis(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Water
    ctx.fillStyle = "#3e92cc"
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.6, CELL_SIZE * 0.4, CELL_SIZE * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Palm tree trunk
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.45, y + CELL_SIZE * 0.1, CELL_SIZE * 0.1, CELL_SIZE * 0.4)

    // Palm leaves
    ctx.fillStyle = "#2e8b57"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.1, CELL_SIZE * 0.2, 0, Math.PI, true)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.1, CELL_SIZE * 0.2, 0, Math.PI, true)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y, CELL_SIZE * 0.2, 0, Math.PI, true)
    ctx.fill()
  }

  function drawCamel(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#d4bc9c"

    // Body
    ctx.beginPath()
    ctx.ellipse(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.7, CELL_SIZE * 0.4, CELL_SIZE * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Neck and head
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.6)
    ctx.quadraticCurveTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.3, x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.1)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.2)
    ctx.quadraticCurveTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.3, x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.6)
    ctx.fill()

    // Humps
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.5, CELL_SIZE * 0.15, Math.PI, 0, true)
    ctx.fill()
  }

  // Snow props
  function drawPine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Trunk
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.45, y + CELL_SIZE * 0.7, CELL_SIZE * 0.1, CELL_SIZE * 0.3)

    // Tree
    ctx.fillStyle = "#006400"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.5, y)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.65, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.85, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.65, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.35, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.15, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.35, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.5, y)
    ctx.fill()

    // Snow
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.1, CELL_SIZE * 0.05, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.4, CELL_SIZE * 0.05, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.6, CELL_SIZE * 0.05, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawSnowman(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#ffffff"

    // Body
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.8, CELL_SIZE * 0.3, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.4, CELL_SIZE * 0.25, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.1, CELL_SIZE * 0.15, 0, Math.PI * 2)
    ctx.fill()

    // Eyes and buttons
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.45, y + CELL_SIZE * 0.08, CELL_SIZE * 0.03, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.55, y + CELL_SIZE * 0.08, CELL_SIZE * 0.03, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.03, 0, Math.PI * 2)
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.65, CELL_SIZE * 0.03, 0, Math.PI * 2)
    ctx.fill()

    // Carrot nose
    ctx.fillStyle = "#FFA500"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.12)
    ctx.lineTo(x + CELL_SIZE * 0.65, y + CELL_SIZE * 0.15)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.18)
    ctx.fill()
  }

  function drawIce(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "rgba(173, 216, 230, 0.5)"

    // Ice block
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.9)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.7)
    ctx.fill()

    // Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.4)
    ctx.fill()
  }

  function drawCrystal(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = "#9370DB"

    // Crystal
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.5, y)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.6, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.5, y)
    ctx.fill()

    // Highlight
    ctx.fillStyle = "#D8BFD8"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.1)
    ctx.lineTo(x + CELL_SIZE * 0.6, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.1)
    ctx.fill()
  }

  function drawIgloo(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Igloo dome
    ctx.fillStyle = "#F0F8FF"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.4, Math.PI, 0, true)
    ctx.closePath()
    ctx.fill()

    // Entrance
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.7, CELL_SIZE * 0.15, Math.PI, 0, true)
    ctx.closePath()
    ctx.fill()

    // Snow blocks pattern
    ctx.strokeStyle = "#E0E0E0"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.3, Math.PI, 0, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.5, CELL_SIZE * 0.2, Math.PI, 0, true)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.7)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.5)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.7)
    ctx.stroke()
  }

  function drawCabin(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Cabin base
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.4, CELL_SIZE * 0.6, CELL_SIZE * 0.4)

    // Roof
    ctx.fillStyle = "#654321"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.1)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.4)
    ctx.closePath()
    ctx.fill()

    // Door
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.5, CELL_SIZE * 0.2, CELL_SIZE * 0.3)

    // Window
    ctx.fillStyle = "#87CEEB"
    ctx.fillRect(x + CELL_SIZE * 0.6, y + CELL_SIZE * 0.5, CELL_SIZE * 0.1, CELL_SIZE * 0.1)

    // Snow on roof
    ctx.fillStyle = "#FFFFFF"
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.15)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.4)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.35)
    ctx.lineTo(x + CELL_SIZE * 0.5, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.35)
    ctx.closePath()
    ctx.fill()
  }

  function drawSled(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Sled base
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.6, CELL_SIZE * 0.6, CELL_SIZE * 0.1)

    // Sled runners
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.1, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.7)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.7)
    ctx.lineTo(x + CELL_SIZE * 0.7, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.9, y + CELL_SIZE * 0.8)
    ctx.lineTo(x + CELL_SIZE * 0.8, y + CELL_SIZE * 0.7)
    ctx.fill()

    // Sled back
    ctx.beginPath()
    ctx.moveTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.6)
    ctx.lineTo(x + CELL_SIZE * 0.2, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.3, y + CELL_SIZE * 0.2)
    ctx.lineTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.3)
    ctx.lineTo(x + CELL_SIZE * 0.4, y + CELL_SIZE * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  function drawThemeBackground(ctx: CanvasRenderingContext2D, theme: string, width: number, height: number) {
    switch (theme) {
      case "cyberpunk":
        // Grid lines
        ctx.strokeStyle = "rgba(255, 0, 255, 0.2)"
        ctx.lineWidth = 1

        // Horizontal lines
        for (let y = 0; y < height; y += CELL_SIZE * 2) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        // Vertical lines
        for (let x = 0; x < width; x += CELL_SIZE * 2) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        break

      case "underwater":
        // Bubbles
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = Math.random() * 5 + 2
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Light rays
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 10
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * width
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x - 100, height)
          ctx.stroke()
        }
        break

      case "lava":
        // Lava bubbles
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * width
          const y = height - (Math.random() * height) / 2
          const size = Math.random() * 20 + 10

          // Glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
          gradient.addColorStop(0, "rgba(255, 200, 0, 0.6)")
          gradient.addColorStop(1, "rgba(255, 0, 0, 0)")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case "space":
        // Stars
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = Math.random() * 1.5
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Distant planets
        const colors = ["#ff5555", "#55ffff", "#5555ff", "#55ff55"]
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const size = Math.random() * 8 + 3
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.globalAlpha = 0.5
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
        break
    }
  }

  function changeDirection(newDirection: Direction) {
    // Prevent 180-degree turns
    if (
      (direction === "up" && newDirection === "down") ||
      (direction === "down" && newDirection === "up") ||
      (direction === "left" && newDirection === "right") ||
      (direction === "right" && newDirection === "left")
    ) {
      return
    }

    setNextDirection(newDirection)
  }

  function togglePause() {
    setIsPaused(!isPaused)
  }

  function toggleSound() {
    setSoundMuted(!soundMuted)

    if (soundMuted && ambientSoundRef.current) {
      ambientSoundRef.current.pause()
    } else if (!soundMuted && ambientSoundRef.current) {
      ambientSoundRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }
  }

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen)

    // Update canvas size after toggling fullscreen
    setTimeout(updateCanvasSize, 100)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full flex-col items-center justify-center"
    >
      <div className="mb-4 flex w-full justify-between">
        <div className="flex gap-4">
          <div className="rounded-md bg-gray-800 px-3 py-1 font-medium text-white">Score: {score}</div>
          <div className="rounded-md bg-gray-800 px-3 py-1 font-medium text-white">Level: {level}</div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-md bg-gray-800 px-3 py-1 font-medium text-white">
            Theme: {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
          </div>
          <button
            onClick={toggleSound}
            className="flex items-center justify-center rounded-md bg-gray-800 px-2 text-white"
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative ${isFullscreen ? "fixed inset-0 z-50 flex items-center justify-center bg-black p-4" : ""}`}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={`rounded-lg border-4 ${
            inDanger
              ? "danger-border"
              : settings.theme === "forest"
                ? "border-emerald-500"
                : settings.theme === "desert"
                  ? "border-orange-500"
                  : settings.theme === "snow"
                    ? "border-blue-500"
                    : settings.theme === "neon"
                      ? "border-fuchsia-500"
                      : settings.theme === "cyberpunk"
                        ? "border-pink-500"
                        : settings.theme === "underwater"
                          ? "border-blue-400"
                          : settings.theme === "lava"
                            ? "border-orange-600"
                            : "border-purple-600"
          } ${inDanger ? "shake" : ""}`}
        />

        <button
          onClick={toggleFullscreen}
          className="absolute right-2 top-2 rounded-full bg-gray-800 p-2 text-white opacity-70 hover:opacity-100"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/80 px-6 py-3 text-xl font-bold text-emerald-400"
            >
              Level Up! {level}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`mt-6 flex w-full flex-col items-center gap-4 ${
          isFullscreen ? "fixed bottom-4 left-0 right-0 z-50" : ""
        }`}
      >
        <GameControls
          onDirectionChange={changeDirection}
          onPauseClick={togglePause}
          onMenuClick={onMenuClick}
          isPaused={isPaused}
        />
      </div>
    </motion.div>
  )
}
