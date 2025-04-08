"use client"

import { useState } from "react"
import MenuScreen from "@/components/menu-screen"
import GameScreen from "@/components/game-screen"
import SettingsScreen from "@/components/settings-screen"
import AboutScreen from "@/components/about-screen"
import GameOverScreen from "@/components/game-over-screen"
import { GameProvider } from "@/context/game-context"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"menu" | "game" | "settings" | "about" | "gameOver">("menu")
  const [finalScore, setFinalScore] = useState(0)
  const [finalLevel, setFinalLevel] = useState(1)

  const handleGameOver = (score: number, level: number) => {
    setFinalScore(score)
    setFinalLevel(level)
    setCurrentScreen("gameOver")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <GameProvider>
        {currentScreen === "menu" && (
          <MenuScreen
            onPlayClick={() => setCurrentScreen("game")}
            onSettingsClick={() => setCurrentScreen("settings")}
            onAboutClick={() => setCurrentScreen("about")}
          />
        )}

        {currentScreen === "game" && (
          <GameScreen onMenuClick={() => setCurrentScreen("menu")} onGameOver={handleGameOver} />
        )}

        {currentScreen === "settings" && <SettingsScreen onBackClick={() => setCurrentScreen("menu")} />}

        {currentScreen === "about" && <AboutScreen onBackClick={() => setCurrentScreen("menu")} />}

        {currentScreen === "gameOver" && (
          <GameOverScreen
            score={finalScore}
            level={finalLevel}
            onPlayAgainClick={() => setCurrentScreen("game")}
            onMenuClick={() => setCurrentScreen("menu")}
          />
        )}
      </GameProvider>
    </main>
  )
}
