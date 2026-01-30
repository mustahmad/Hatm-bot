import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api, Group } from '../api/client'
import GroupCard from '../components/GroupCard'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
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
      <Header
        title={`Ассалам алейкум, ${user?.first_name || 'друг'}!`}
        rightAction={
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm border border-emerald-100/50 hover:bg-emerald-50 transition-colors"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        }
        subtitle="Ваши группы для хатма"
      />

      <div className="px-4 py-6">
        {/* Islamic decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center gap-4 mb-6"
        >
          <span className="text-2xl opacity-40 text-emerald-600">☪</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
          <span className="text-xl opacity-50 text-emerald-600">🕌</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
          <span className="text-2xl opacity-40 text-emerald-600">☪</span>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/create-group')}
            className="flex-1 btn-primary"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать группу
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/join-group')}
            className="flex-1 btn-secondary"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Вступить
            </span>
          </motion.button>
        </div>

        {/* Groups list */}
        {loading ? (
          <LoadingSpinner text="Загрузка групп..." />
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon="🕌"
            title="Пока нет групп"
            description="Создайте свою группу для хатма или присоединитесь к существующей"
            action={{
              label: "Создать группу",
              onClick: () => navigate('/create-group')
            }}
          />
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
