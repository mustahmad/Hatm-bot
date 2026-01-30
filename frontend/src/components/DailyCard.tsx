import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyItem {
  id: number
  title: string
  description: string
  tag: string
  emoji?: string
}

// Статьи для Daily
const dailyItems: DailyItem[] = [
  {
    id: 1,
    title: 'Топ 5 продуктов на ифтар',
    description: 'Что обязательно должно быть на столе для правильного ифтара? Мы собрали топ-5 продуктов, с которых сунна рекомендует начинать разговение.',
    tag: 'Питание',
    emoji: '🍽️'
  },
  {
    id: 2,
    title: 'Ночь Кадр - Ляйлятуль-Кадр',
    description: 'Ночь предопределения лучше тысячи месяцев. Узнайте, как провести эту благословенную ночь и какие дуа читать.',
    tag: 'Важное',
    emoji: '🌙'
  },
  {
    id: 3,
    title: 'Лайфхаки для Рамадана',
    description: 'Как сохранить энергию в течение дня поста? 7 проверенных советов от врачей и опытных постящихся.',
    tag: 'Советы',
    emoji: '💡'
  },
  {
    id: 4,
    title: 'Рецепт: Финиковые шарики',
    description: 'Простой и полезный рецепт для сухура. Готовится за 10 минут, даёт энергию на весь день.',
    tag: 'Рецепты',
    emoji: '🥣'
  },
  {
    id: 5,
    title: 'Последние 10 дней Рамадана',
    description: 'Особенности и достоинства последней декады. Как провести это время с максимальной пользой.',
    tag: 'Важное',
    emoji: '📿'
  },
]

export default function DailyCard() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const currentItem = dailyItems[currentIndex]

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Daily-daily:</h2>

      <motion.div
        className="card cursor-pointer relative overflow-hidden"
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header with title and tag */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentItem.emoji && (
                  <span className="text-2xl">{currentItem.emoji}</span>
                )}
                <h3 className="text-lg font-semibold text-gray-800">{currentItem.title}</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full whitespace-nowrap">
                {currentItem.tag}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {currentItem.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 pt-2">
          {dailyItems.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-emerald-500'
                  : 'w-4 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
