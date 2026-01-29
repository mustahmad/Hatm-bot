import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api, GroupDetail, HatmProgress } from '../api/client'
import Header from '../components/Header'
import CircularTracker from '../components/CircularTracker'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Group() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { initData } = useTelegram()
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [progress, setProgress] = useState<HatmProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGroup()
  }, [id, initData])

  const loadGroup = async () => {
    if (!initData || !id) return

    try {
      setLoading(true)
      const groupData = await api.getGroup(parseInt(id), initData)
      setGroup(groupData)

      if (groupData.active_hatm) {
        const progressData = await api.getHatmProgress(groupData.active_hatm.id, initData)
        setProgress(progressData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Загрузка..." showBack />
        <LoadingSpinner text="Загрузка группы..." />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen">
        <Header title="Ошибка" showBack />
        <div className="text-center py-8 text-red-500">{error || 'Группа не найдена'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title={group.name}
        subtitle={`${group.members.length} участник${getParticipantsSuffix(group.members.length)}`}
        showBack
        rightAction={
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Присоединяйтесь к группе ${group.name}`,
                  text: `Код приглашения: ${group.invite_code}`,
                })
              } else {
                navigator.clipboard.writeText(group.invite_code)
              }
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        }
      />

      <div className="px-4 py-6">
        {/* Invite code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="text-sm text-gray-500 mb-1">Код приглашения</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-wider text-gray-800">
              {group.invite_code}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(group.invite_code)}
              className="text-green-600 text-sm font-medium"
            >
              Копировать
            </button>
          </div>
        </motion.div>

        {/* Active Hatm or Create button */}
        {group.active_hatm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Progress tracker */}
            <div className="flex justify-center mb-6">
              <CircularTracker
                juzAssignments={progress?.juz_assignments || []}
                onJuzClick={(juz) => navigate(`/hatm/${group.active_hatm!.id}`)}
              />
            </div>

            {/* Hatm stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{progress?.completed_juzs || 0}</div>
                <div className="text-xs text-gray-500">Прочитано</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-gray-600">{progress?.pending_juzs || 0}</div>
                <div className="text-xs text-gray-500">Осталось</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-600">{progress?.debt_juzs || 0}</div>
                <div className="text-xs text-gray-500">Долги</div>
              </div>
            </div>

            {/* View hatm button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/hatm/${group.active_hatm!.id}`)}
              className="w-full btn-primary"
            >
              Подробнее о хатме
            </motion.button>
          </motion.div>
        ) : (
          <EmptyState
            icon="📖"
            title="Нет активного хатма"
            description="Создайте новый хатм для группы"
            action={{
              label: "Создать хатм",
              onClick: () => navigate(`/group/${id}/create-hatm`)
            }}
          />
        )}

        {/* Members list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold mb-4">Участники</h3>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {(member.first_name || member.username || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {member.first_name || member.username || 'Участник'}
                  </div>
                  {member.username && (
                    <div className="text-sm text-gray-500">@{member.username}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function getParticipantsSuffix(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return ''
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а'
  return 'ов'
}
