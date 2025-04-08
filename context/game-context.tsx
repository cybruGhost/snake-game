"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface GameSettings {
  difficulty: string
  theme: string
  soundEnabled: boolean
  particleEffects: boolean
}

interface GameContextType {
  settings: GameSettings
  updateSettings: (newSettings: Partial<GameSettings>) => void
}

const defaultSettings: GameSettings = {
  difficulty: "medium",
  theme: "forest",
  soundEnabled: true,
  particleEffects: true,
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings)

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  return <GameContext.Provider value={{ settings, updateSettings }}>{children}</GameContext.Provider>
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}
