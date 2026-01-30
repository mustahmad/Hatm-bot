import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api, Group } from '../api/client'
import GroupCard from '../components/GroupCard'
import DailyCard from '../components/DailyCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Home() {
  const navigate = useNavigate()
  const { user, initData } = useTelegram()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGroups()
  }, [initData])

  const loadGroups = async () => {
    if (!initData) return

    try {
      setLoading(true)
      const data = await api.getGroups(initData)
      setGroups(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Ассалям алейкум,
              </h1>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {user?.first_name || 'друг'}!
              </h1>
              <p className="text-emerald-600 text-sm font-medium">
                Ваши группы для хатма
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-lg font-semibold">
                {(user?.first_name || 'U').charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="px-4 pb-6">
        {/* Daily section */}
        <DailyCard />

        {/* Groups section */}
        <h2 className="text-xl font-bold text-gray-800 mb-3">Мои группы:</h2>

        {loading ? (
          <LoadingSpinner text="Загрузка групп..." />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-8"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-semibold text-gray-800 mb-2">Пока нет групп</h3>
            <p className="text-gray-500 text-sm mb-4">
              Создайте свою группу для хатма или присоединитесь к существующей
            </p>
            <button
              onClick={() => navigate('/create-group')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать группу
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {groups.map((group, index) => (
              <GroupCard key={group.id} group={group} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
