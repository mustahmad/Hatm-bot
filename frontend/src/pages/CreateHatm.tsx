import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'
import Header from '../components/Header'

export default function CreateHatm() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { initData, webApp } = useTelegram()
  const [durationDays, setDurationDays] = useState(7)
  const [participantsCount, setParticipantsCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!initData || !groupId) return

    try {
      setLoading(true)
      setError(null)
      const hatm = await api.createHatm(
        parseInt(groupId),
        durationDays,
        participantsCount,
        initData
      )
      webApp?.HapticFeedback.notificationOccurred('success')
      navigate(`/hatm/${hatm.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Создать хатм" showBack />

      <div className="px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Info card */}
          <div className="card bg-purple-50 border-purple-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <h3 className="font-semibold text-gray-800">Настройте хатм</h3>
                <p className="text-sm text-gray-600 mt-1">
                  30 джузов будут автоматически распределены между участниками
                </p>
              </div>
            </div>
          </div>

          {/* Duration selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Длительность: {durationDays} {durationDays === 1 ? 'день' : durationDays < 5 ? 'дня' : 'дней'}
            </label>
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:bg-green-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>
          </div>

          {/* Participants count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Количество участников: {participantsCount}
            </label>
            <div className="px-2">
              <input
                type="range"
                min="1"
                max="30"
                value={participantsCount}
                onChange={(e) => setParticipantsCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:bg-green-500
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:shadow-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>
          </div>

          {/* Distribution preview */}
          <div className="card bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-2">Распределение джузов</h4>
            <p className="text-sm text-gray-600">
              {participantsCount === 30 ? (
                'Каждый участник получит по 1 джузу'
              ) : participantsCount === 1 ? (
                'Один участник прочитает все 30 джузов'
              ) : (
                <>
                  {Math.floor(30 / participantsCount)} джуз(а) на участника
                  {30 % participantsCount > 0 && (
                    <>, {30 % participantsCount} участник(ов) получат +1 джуз</>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать хатм'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
