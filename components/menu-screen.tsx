"use client"

import { motion } from "framer-motion"

interface MenuScreenProps {
  onPlayClick: () => void
  onSettingsClick: () => void
  onAboutClick: () => void
}

export default function MenuScreen({ onPlayClick, onSettingsClick, onAboutClick }: MenuScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-b from-indigo-900 to-blue-900 p-8 text-center shadow-2xl"
    >
      <motion.h1
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 1.5,
        }}
        className="mb-2 text-5xl font-bold text-emerald-400 drop-shadow-glow"
      >
        Legendary Snake
      </motion.h1>
      <p className="mb-8 text-gray-300">by Emily and cyberghost</p>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayClick}
          className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
        >
          Play Game
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
        >
          Settings
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAboutClick}
          className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
        >
          About
        </motion.button>
      </div>
    </motion.div>
  )
}
