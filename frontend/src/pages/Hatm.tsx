import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api, HatmProgress, JuzAssignment, HatmResponse, User } from '../api/client'
import Header from '../components/Header'
import CircularTracker from '../components/CircularTracker'
import JuzList from '../components/JuzList'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Hatm() {
  const { id } = useParams<{ id: string }>()
  const { initData, webApp } = useTelegram()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [hatm, setHatm] = useState<HatmResponse | null>(null)
  const [progress, setProgress] = useState<HatmProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<number | null>(null)
  const [finishingHatm, setFinishingHatm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHatm = useCallback(async () => {
    if (!initData || !id) return

    try {
      setLoading(true)

      // Получаем внутренний ID пользователя из базы
      const userData = await api.getMe(initData)
      setCurrentUser(userData)

      const hatmData = await api.getHatm(parseInt(id), initData)
      setHatm(hatmData)

      const progressData = await api.getHatmProgress(parseInt(id), initData)
      setProgress(progressData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [id, initData])

  useEffect(() => {
    loadHatm()
  }, [loadHatm])

  const startHatm = async () => {
    if (!initData || !id || !hatm) return

    try {
      setLoading(true)
      await api.startHatm(parseInt(id), initData)
      await loadHatm()
      webApp?.HapticFeedback.notificationOccurred('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запуска')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  const completeJuz = async (juz: JuzAssignment) => {
    if (!initData || completing) return

    try {
      setCompleting(juz.id)
      await api.completeJuz(juz.id, initData)
      await loadHatm()
      webApp?.HapticFeedback.notificationOccurred('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setCompleting(null)
    }
  }

  const finishHatm = async () => {
    if (!initData || !id || finishingHatm) return

    try {
      setFinishingHatm(true)
      await api.completeHatm(parseInt(id), initData)
      await loadHatm()
      webApp?.HapticFeedback.notificationOccurred('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка завершения')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setFinishingHatm(false)
    }
  }

  if (loading && !hatm) {
    return (
      <div className="min-h-screen">
        <Header title="Загрузка..." showBack />
        <LoadingSpinner text="Загрузка хатма..." />
      </div>
    )
  }

  if (error || !hatm) {
    return (
      <div className="min-h-screen">
        <Header title="Ошибка" showBack />
        <div className="text-center py-8 text-red-500">{error || 'Хатм не найден'}</div>
      </div>
    )
  }

  const getStatusText = () => {
    if (hatm.status === 'pending') return 'Ожидает старта'
    if (hatm.status === 'completed') return 'Завершен'
    if (hatm.ends_at) {
      const daysLeft = Math.ceil((new Date(hatm.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return `Осталось ${daysLeft} дн.`
    }
    return 'Активен'
  }

  return (
    <div className="min-h-screen">
      <Header
        title="📖 Хатм"
        subtitle={getStatusText()}
        showBack
      />

      <div className="px-4 py-6">
        {/* Pending state - show start button */}
        {hatm.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold mb-2">Хатм готов к запуску</h2>
            <p className="text-gray-500 mb-6">
              Длительность: {hatm.duration_days} дн.<br />
              Участников: {hatm.participants_count}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startHatm}
              disabled={loading}
              className="btn-primary text-lg px-8 py-4"
            >
              {loading ? 'Запуск...' : 'Начать хатм'}
            </motion.button>
          </motion.div>
        )}

        {/* Active or completed state */}
        {hatm.status !== 'pending' && progress && (
          <>
            {/* Circular tracker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-8"
            >
              <CircularTracker
                juzAssignments={progress.juz_assignments}
              />
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card text-center"
              >
                <div className="text-2xl font-bold text-green-600">{progress.completed_juzs}</div>
                <div className="text-xs text-gray-500">Прочитано</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card text-center"
              >
                <div className="text-2xl font-bold text-gray-600">{progress.pending_juzs}</div>
                <div className="text-xs text-gray-500">Осталось</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card text-center"
              >
                <div className="text-2xl font-bold text-orange-600">{progress.debt_juzs}</div>
                <div className="text-xs text-gray-500">Долги</div>
              </motion.div>
            </div>

            {/* Completed banner */}
            {hatm.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card gradient-green text-white text-center mb-6"
              >
                <div className="text-2xl mb-1">🎉</div>
                <div className="font-bold">Хатм завершен!</div>
                <div className="text-sm opacity-90">Аллахумма баракалана!</div>
              </motion.div>
            )}

            {/* Juz list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-green-700">Список джузов</h3>
              <JuzList
                juzAssignments={progress.juz_assignments}
                currentUserId={currentUser?.id}
                onComplete={completeJuz}
                isLoading={completing !== null}
              />
            </motion.div>

            {/* Finish hatm button - only for active hatms */}
            {hatm.status === 'active' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <button
                  onClick={finishHatm}
                  disabled={finishingHatm}
                  className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
                >
                  {finishingHatm ? 'Завершение...' : 'Завершить хатм'}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
