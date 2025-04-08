"use client"

import { motion } from "framer-motion"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Menu, Pause, Play } from "lucide-react"

interface GameControlsProps {
  onDirectionChange: (direction: "up" | "down" | "left" | "right") => void
  onPauseClick: () => void
  onMenuClick: () => void
  isPaused: boolean
}

export default function GameControls({ onDirectionChange, onPauseClick, onMenuClick, isPaused }: GameControlsProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onTouchStart={(e) => {
            e.preventDefault()
            onDirectionChange("up")
          }}
          onClick={(e) => {
            e.preventDefault()
            onDirectionChange("up")
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-gray-900 shadow-md active:bg-emerald-600"
        >
          <ArrowUp size={28} />
        </motion.button>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onTouchStart={(e) => {
              e.preventDefault()
              onDirectionChange("left")
            }}
            onClick={(e) => {
              e.preventDefault()
              onDirectionChange("left")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-gray-900 shadow-md active:bg-emerald-600"
          >
            <ArrowLeft size={28} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onTouchStart={(e) => {
              e.preventDefault()
              onDirectionChange("down")
            }}
            onClick={(e) => {
              e.preventDefault()
              onDirectionChange("down")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-gray-900 shadow-md active:bg-emerald-600"
          >
            <ArrowDown size={28} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onTouchStart={(e) => {
              e.preventDefault()
              onDirectionChange("right")
            }}
            onClick={(e) => {
              e.preventDefault()
              onDirectionChange("right")
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-gray-900 shadow-md active:bg-emerald-600"
          >
            <ArrowRight size={28} />
          </motion.button>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPauseClick}
          className="flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 font-medium text-gray-900"
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
          {isPaused ? "Resume" : "Pause"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="flex items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 font-medium text-gray-900"
        >
          <Menu size={20} />
          Menu
        </motion.button>
      </div>
    </>
  )
}
