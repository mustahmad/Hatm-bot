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
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/group/${group.id}`)}
      className="card cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Group icon */}
          <div className="w-12 h-12 rounded-2xl gradient-green flex items-center justify-center shadow-md relative">
            <span className="text-white text-xl">📖</span>
            <span className="absolute -top-1 -right-1 text-xs">☪</span>
          </div>

          {/* Group info */}
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {group.name}
            </h3>
            <p className="text-sm text-gray-500">
              {group.members_count} участник{getParticipantsSuffix(group.members_count)}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {group.has_active_hatm && (
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              Активный хатм
            </span>
          )}
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}

function getParticipantsSuffix(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return ''
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'а'
  return 'ов'
}
