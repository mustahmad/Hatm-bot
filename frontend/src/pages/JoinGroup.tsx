import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTelegram } from '../hooks/useTelegram'
import { api } from '../api/client'
import Header from '../components/Header'

export default function JoinGroup() {
  const navigate = useNavigate()
  const { initData, webApp } = useTelegram()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!initData || code.length !== 8) return

    try {
      setLoading(true)
      setError(null)
      const group = await api.joinGroup(code.toUpperCase(), initData)
      webApp?.HapticFeedback.notificationOccurred('success')
      navigate(`/group/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Группа не найдена')
      webApp?.HapticFeedback.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (cleaned.length <= 8) {
      setCode(cleaned)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Вступить в группу" showBack />

      <div className="px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Info card */}
          <div className="card bg-blue-50 border-blue-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <h3 className="font-semibold text-gray-800">Введите код приглашения</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Получите код у организатора группы
                </p>
              </div>
            </div>
          </div>

          {/* Code input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Код приглашения
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABCD1234"
              className="input text-center text-2xl font-mono tracking-widest"
              maxLength={8}
              required
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              {code.length}/8 символов
            </p>
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
            disabled={loading || code.length !== 8}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Вступить в группу'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}
