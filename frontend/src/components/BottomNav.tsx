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
      {/* Bottom sheet menu for create */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-header rounded-t-3xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Menu items */}
              <div className="px-4 pb-8">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate('/create-group')
                  }}
                  className="w-full p-4 rounded-2xl hover:bg-emerald-50 transition-colors flex items-center gap-4 mb-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 text-lg">Создать группу</div>
                    <div className="text-sm text-gray-500">Новая группа для хатма</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false)
                    navigate('/join-group')
                  }}
                  className="w-full p-4 rounded-2xl hover:bg-emerald-50 transition-colors flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 text-lg">Вступить в группу</div>
                    <div className="text-sm text-gray-500">По коду приглашения</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation - floating pill */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-30"
      >
        <div className="glass-nav-floating rounded-[20px] px-4 py-2 max-w-md mx-auto flex justify-between items-center">
          {/* Create button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center flex-1"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              showMenu
                ? 'glass-active'
                : 'glass-button'
            }`}>
              <svg
                className={`w-5 h-5 transition-colors ${showMenu ? 'text-white' : 'text-emerald-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className={`text-[10px] mt-1 font-medium ${showMenu ? 'text-emerald-600' : 'text-gray-500'}`}>
              Создать
            </span>
          </button>

          {/* Home button */}
          <button
            onClick={() => {
              setShowMenu(false)
              navigate('/')
            }}
            className="flex flex-col items-center flex-1"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isActive('/') && !showMenu
                ? 'glass-active'
                : 'glass-button'
            }`}>
              {isActive('/') && !showMenu ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive('/') && !showMenu ? 'text-emerald-600' : 'text-gray-500'}`}>
              Главная
            </span>
          </button>

          {/* Profile button */}
          <button
            onClick={() => {
              setShowMenu(false)
              navigate('/profile')
            }}
            className="flex flex-col items-center flex-1"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isActive('/profile')
                ? 'glass-active'
                : 'glass-button'
            }`}>
              {isActive('/profile') ? (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive('/profile') ? 'text-emerald-600' : 'text-gray-500'}`}>
              Профиль
            </span>
          </button>
        </div>
      </motion.div>

      {/* Fade overlay at bottom of screen */}
      <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-20 bottom-fade-overlay" />
    </>
  )
}
