import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Popup menu for create */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden min-w-[200px]"
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate('/create-group')
                }}
                className="w-full px-5 py-4 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 border-b border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Создать группу</div>
                  <div className="text-xs text-gray-500">Новая группа для хатма</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate('/join-group')
                }}
                className="w-full px-5 py-4 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Вступить в группу</div>
                  <div className="text-xs text-gray-500">По коду приглашения</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-emerald-100/50 px-4 py-2 pb-safe z-50"
        style={{ boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.08)' }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Create button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all duration-200 ${
              showMenu ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showMenu ? 'bg-emerald-500 text-white' : 'border-2 border-current'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs mt-1 font-medium">Создать</span>
          </button>

          {/* Home button */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all duration-200 relative ${
              isActive('/') && !showMenu
                ? 'text-emerald-600'
                : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <svg className="w-7 h-7" fill={isActive('/') && !showMenu ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/') && !showMenu ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1 font-medium">Главная</span>
          </button>

          {/* Profile button */}
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all duration-200 ${
              isActive('/profile')
                ? 'text-emerald-600'
                : 'text-gray-400 hover:text-emerald-500'
            }`}
          >
            <svg className="w-7 h-7" fill={isActive('/profile') ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive('/profile') ? 0 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1 font-medium">Профиль</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}
