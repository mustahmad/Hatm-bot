import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'
import Header from '../components/Header'

export default function CreateGroup() {
  const navigate = useNavigate()
  const { initData, webApp } = useTelegram()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!initData || !name.trim()) return

    try {
      setLoading(true)
      setError(null)
      const group = await api.createGroup(name.trim(), initData)
      webApp?.HapticFeedback.notificationOccurred('success')
      navigate(`/group/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Создать группу" showBack />

      <div className="px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Info card */}
          <div className="card bg-green-50 border-green-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <h3 className="font-semibold text-gray-800">Создайте группу для хатма</h3>
                <p className="text-sm text-gray-600 mt-1">
                  После создания вы получите код приглашения, который можно отправить участникам
                </p>
              </div>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название группы
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Семейный хатм"
              className="input bg-white text-gray-900 placeholder-gray-400"
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
              maxLength={100}
              required
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать группу'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
