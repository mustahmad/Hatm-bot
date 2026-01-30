import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Group } from '../api/client'

interface GroupCardProps {
  group: Group
  index?: number
}

export default function GroupCard({ group, index = 0 }: GroupCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/group/${group.id}`)}
      className="card cursor-pointer shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        {/* Group info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-800 text-lg">
              {group.name}
            </h3>
            {group.has_active_hatm ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                Активный
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                Завершен
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {group.members_count} участник{getParticipantsSuffix(group.members_count)}
          </p>
        </div>

        {/* Arrow */}
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  )
}

function getParticipantsSuffix(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return ''
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а'
  return 'ов'
}
