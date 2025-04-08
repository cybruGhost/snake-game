"use client"

import { motion } from "framer-motion"

interface GameOverScreenProps {
  score: number
  level: number
  onPlayAgainClick: () => void
  onMenuClick: () => void
}

export default function GameOverScreen({ score, level, onPlayAgainClick, onMenuClick }: GameOverScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex w-full max-w-md flex-col items-center rounded-lg bg-gray-800 p-8 shadow-xl"
    >
      <h2 className="mb-6 text-4xl font-bold text-red-500">Game Over</h2>

      <div className="mb-8 space-y-2 text-center">
        <p className="text-2xl font-semibold text-white">Score: {score}</p>
        <p className="text-xl text-white">Level: {level}</p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgainClick}
          className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
        >
          Play Again
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
        >
          Back to Menu
        </motion.button>
      </div>
    </motion.div>
  )
}
