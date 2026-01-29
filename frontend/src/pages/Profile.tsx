import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api, UserJuzStats } from '../api/client'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const navigate = useNavigate()
  const { user, initData } = useTelegram()
  const [stats, setStats] = useState<UserJuzStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [initData])

  const loadStats = async () => {
    if (!initData) return

    try {
      setLoading(true)
      const data = await api.getMyJuzs(initData)
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Мой профиль"
        showBack
      />

      <div className="px-4 py-6">
        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white font-bold">
              {(user?.first_name || '?').charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {user?.first_name || 'Пользователь'}
          </h2>
          {user?.username && (
            <p className="text-gray-500">@{user.username}</p>
          )}
        </motion.div>

        {/* Islamic decoration */}
        <div className="flex justify-center mb-6">
          <span className="text-4xl opacity-30">&#9788;</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Загрузка статистики..." />
        ) : stats ? (
          <>
            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <div className="card text-center">
                <div className="text-3xl mb-1">📖</div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-gray-500">Прочитано джузов</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-1">⏳</div>
                <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                <div className="text-xs text-gray-500">Ожидают прочтения</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-1">📚</div>
                <div className="text-2xl font-bold text-blue-600">{stats.total_assigned}</div>
                <div className="text-xs text-gray-500">Всего назначено</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl mb-1">⚠️</div>
                <div className="text-2xl font-bold text-orange-600">{stats.debts}</div>
                <div className="text-xs text-gray-500">Долгов</div>
              </div>
            </motion.div>

            {/* Progress */}
            {stats.total_assigned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card mb-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Общий прогресс</span>
                  <span className="text-sm font-bold text-green-600">
                    {Math.round((stats.completed / stats.total_assigned) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.completed / stats.total_assigned) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* My juzs list */}
            {stats.juzs && stats.juzs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 text-green-700">Мои джузы</h3>
                <div className="space-y-2">
                  {stats.juzs.map((juz) => (
                    <div
                      key={juz.id}
                      className={`card flex items-center justify-between ${
                        juz.status === 'completed' ? 'bg-green-50' :
                        juz.status === 'debt' ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                          ${juz.status === 'completed' ? 'bg-green-500' :
                            juz.status === 'debt' ? 'bg-orange-500' : 'bg-gray-400'}
                        `}>
                          {juz.juz_number}
                        </div>
                        <span className="font-medium">Джуз {juz.juz_number}</span>
                      </div>
                      <span className={`
                        text-xs px-3 py-1 rounded-full font-medium
                        ${juz.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                        ${juz.status === 'debt' ? 'bg-orange-100 text-orange-700' : ''}
                        ${juz.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
                      `}>
                        {juz.status === 'completed' ? 'Прочитан' :
                         juz.status === 'debt' ? 'Долг' : 'Ожидает'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🕌</div>
            <p className="text-gray-500">Пока нет статистики</p>
            <p className="text-sm text-gray-400 mt-2">
              Присоединитесь к хатму, чтобы начать отслеживать прогресс
            </p>
          </div>
        )}

        {/* Go home button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На главную
          </button>
        </motion.div>
      </div>
    </div>
  )
}
