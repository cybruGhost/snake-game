"use client"

import { motion } from "framer-motion"
import { useGameContext } from "@/context/game-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX } from "lucide-react"

interface SettingsScreenProps {
  onBackClick: () => void
}

export default function SettingsScreen({ onBackClick }: SettingsScreenProps) {
  const { settings, updateSettings } = useGameContext()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex w-full max-w-md flex-col items-center rounded-lg bg-gray-800 p-8 shadow-xl"
    >
      <h2 className="mb-8 text-3xl font-bold text-emerald-400">Game Settings</h2>

      <div className="mb-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <label htmlFor="difficulty" className="text-lg font-medium text-white">
            Difficulty:
          </label>
          <select
            id="difficulty"
            value={settings.difficulty}
            onChange={(e) => updateSettings({ difficulty: e.target.value })}
            className="rounded-md bg-gray-700 px-3 py-2 text-white"
          >
            <option value="easy">Easy (Slower)</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="extreme">Extreme (Fastest)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="theme" className="text-lg font-medium text-white">
            Theme:
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value })}
            className="rounded-md bg-gray-700 px-3 py-2 text-white"
          >
            <option value="forest">Forest</option>
            <option value="desert">Desert</option>
            <option value="snow">Snow</option>
            <option value="neon">Neon</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="underwater">Underwater</option>
            <option value="lava">Lava</option>
            <option value="space">Space</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-toggle" className="text-lg font-medium text-white">
              Sound Effects:
            </Label>
            <div className="flex items-center gap-2">
              <VolumeX size={18} className="text-gray-400" />
              <Switch
                id="sound-toggle"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
              <Volume2 size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="particles-toggle" className="text-lg font-medium text-white">
            Particle Effects:
          </Label>
          <Switch
            id="particles-toggle"
            checked={settings.particleEffects}
            onCheckedChange={(checked) => updateSettings({ particleEffects: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="game-size" className="text-lg font-medium text-white">
            Game Size:
          </Label>
          <Slider
            id="game-size"
            defaultValue={[settings.gameSize || 100]}
            min={70}
            max={130}
            step={10}
            onValueChange={(value) => updateSettings({ gameSize: value[0] })}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Smaller</span>
            <span>Default</span>
            <span>Larger</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBackClick}
        className="rounded-md bg-emerald-500 px-6 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-emerald-400"
      >
        Save & Return
      </motion.button>
    </motion.div>
  )
}
