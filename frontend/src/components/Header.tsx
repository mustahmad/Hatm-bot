import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
}

export default function Header({ title, subtitle, showBack = false, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center
                  hover:bg-emerald-50 transition-colors active:scale-95 shadow-sm border border-emerald-100/50"
              >
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-emerald-600/70">{subtitle}</p>
              )}
            </div>
          </div>
          {rightAction}
        </div>
      </div>
    </motion.header>
  )
}
