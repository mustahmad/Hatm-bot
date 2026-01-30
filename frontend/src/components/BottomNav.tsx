import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navItems = [
    {
      path: '/',
      label: 'Главная',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/profile',
      label: 'Профиль',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-emerald-100/50 px-6 py-2 pb-safe z-50"
      style={{ boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.05)' }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? 'text-emerald-600'
                : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {isActive(item.path) && (
              <motion.div
                layoutId="activeTab"
                className="absolute -bottom-0.5 w-6 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
