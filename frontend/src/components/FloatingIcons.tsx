import { motion } from 'framer-motion'

// Исламские иконки - начинаются ниже хедера (с 25%)
const icons = [
  // Верхний ряд (после хедера)
  { style: { top: '26%', left: '5%', width: 22, height: 22 }, type: 'crescent' },
  { style: { top: '28%', right: '8%', width: 20, height: 20 }, type: 'star' },

  // Центр-верх
  { style: { top: '38%', left: '8%', width: 24, height: 24 }, type: 'lantern' },
  { style: { top: '35%', right: '12%', width: 22, height: 22 }, type: 'mosque' },

  // Центр
  { style: { top: '48%', left: '6%', width: 20, height: 20 }, type: 'star' },
  { style: { top: '50%', right: '6%', width: 24, height: 24 }, type: 'quran' },

  // Центр-низ
  { style: { top: '60%', left: '10%', width: 22, height: 22 }, type: 'beads' },
  { style: { top: '58%', right: '10%', width: 20, height: 20 }, type: 'crescent' },

  // Нижняя часть
  { style: { top: '70%', left: '5%', width: 24, height: 24 }, type: 'mosque' },
  { style: { top: '72%', right: '8%', width: 22, height: 22 }, type: 'lantern' },
]

const iconSvgs: Record<string, JSX.Element> = {
  crescent: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
      <circle cx="18" cy="6" r="1.2" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2l2.4-7.2-6-4.8h7.6L12 2z" />
    </svg>
  ),
  mosque: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V11" />
      <path d="M19 21V11" />
      <path d="M5 11a7 7 0 0114 0" />
      <path d="M12 4v2" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <path d="M9 21v-4a3 3 0 016 0v4" />
    </svg>
  ),
  lantern: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" />
      <path d="M10 4h4" />
      <path d="M8 6h8l1 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2V8l1-2z" />
      <path d="M12 10v4" />
      <path d="M10 12h4" />
    </svg>
  ),
  quran: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
      <path d="M12 6v7" />
      <path d="M9 9l3-2 3 2" />
    </svg>
  ),
  beads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="4" r="2" />
      <circle cx="7" cy="8" r="1.5" />
      <circle cx="17" cy="8" r="1.5" />
      <circle cx="5" cy="14" r="1.5" />
      <circle cx="19" cy="14" r="1.5" />
      <circle cx="8" cy="19" r="1.5" />
      <circle cx="16" cy="19" r="1.5" />
    </svg>
  ),
}

export default function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-emerald-600"
          style={{ ...item.style, opacity: 0.12 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.12,
            y: [0, -6, 0],
            rotate: [0, index % 2 === 0 ? 3 : -3, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: index * 0.05 },
            y: {
              duration: 10 + (index % 5) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2
            },
            rotate: {
              duration: 15 + (index % 3) * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.15
            }
          }}
        >
          {iconSvgs[item.type]}
        </motion.div>
      ))}
    </div>
  )
}
