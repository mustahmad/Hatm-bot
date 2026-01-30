import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TelegramProvider, useTelegram } from './hooks/useTelegram'
import Home from './pages/Home'
import Group from './pages/Group'
import Hatm from './pages/Hatm'
import CreateGroup from './pages/CreateGroup'
import JoinGroup from './pages/JoinGroup'
import CreateHatm from './pages/CreateHatm'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function AppContent() {
  const { webApp, ready } = useTelegram()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (webApp) {
      webApp.ready()
      webApp.expand()
      setIsReady(true)
    }
  }, [webApp])

  if (!ready || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-telegram-bg pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/group/:id" element={<Group />} />
          <Route path="/hatm/:id" element={<Hatm />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/join-group" element={<JoinGroup />} />
          <Route path="/group/:groupId/create-hatm" element={<CreateHatm />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </>
  )
}

function App() {
  return (
    <TelegramProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TelegramProvider>
  )
}

export default App
