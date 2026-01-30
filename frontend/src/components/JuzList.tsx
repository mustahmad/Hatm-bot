import { motion, AnimatePresence } from 'framer-motion'
import { JuzAssignment } from '../api/client'

interface JuzListProps {
  juzAssignments: JuzAssignment[]
  currentUserId?: number
  onComplete?: (juz: JuzAssignment) => void
  isLoading?: boolean
}

export default function JuzList({
  juzAssignments,
  currentUserId,
  onComplete,
  isLoading
}: JuzListProps) {
  const getStatusColor = (status: string, isDebt: boolean) => {
    if (status === 'completed') return 'bg-green-500'
    if (status === 'debt' || isDebt) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  const getStatusText = (status: string, isDebt: boolean) => {
    if (status === 'completed') return 'Прочитан'
    if (status === 'debt' || isDebt) return 'Долг'
    return 'Ожидает'
  }

  const getStatusIcon = (status: string, isDebt: boolean) => {
    if (status === 'completed') return '✓'
    if (status === 'debt' || isDebt) return '!'
    return '○'
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {juzAssignments.map((juz, index) => {
          const isMyJuz = currentUserId && juz.user_id === currentUserId
          const canComplete = isMyJuz && juz.status !== 'completed'

          return (
            <motion.div
              key={juz.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`
                card flex items-center justify-between
                ${isMyJuz ? 'border-green-200 bg-green-50/50' : ''}
                ${canComplete ? 'cursor-pointer active:scale-[0.98]' : ''}
              `}
              onClick={() => canComplete && onComplete?.(juz)}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
                {/* Status indicator */}
                <motion.div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0
                    text-white font-bold text-xs sm:text-sm
                    ${getStatusColor(juz.status, juz.is_debt)}
                  `}
                  animate={juz.status === 'completed' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {getStatusIcon(juz.status, juz.is_debt)}
                </motion.div>

                {/* Juz info */}
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">
                    Джуз {juz.juz_number}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    {juz.first_name || juz.username || 'Участник'}
                    {isMyJuz && <span className="text-green-600 ml-1">(вы)</span>}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!canComplete && (
                  <span className={`
                    text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap
                    ${juz.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                    ${juz.status === 'debt' || juz.is_debt ? 'bg-orange-100 text-orange-700' : ''}
                    ${juz.status === 'pending' && !juz.is_debt ? 'bg-gray-100 text-gray-600' : ''}
                  `}>
                    {getStatusText(juz.status, juz.is_debt)}
                  </span>
                )}

                {canComplete && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 whitespace-nowrap"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      onComplete?.(juz)
                    }}
                  >
                    {isLoading ? '...' : 'Прочитал'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
