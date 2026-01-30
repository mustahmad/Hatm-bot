import { motion } from 'framer-motion'

// Исламские иконки - хаотично расположены по краям экрана (не на элементах UI)
const icons = [
  // Полумесяц со звездой
  {
    style: { top: '5%', left: '3%', width: 32, height: 32 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
        <circle cx="19" cy="5" r="1.5" />
      </svg>
    ),
  },
  // Мечеть
  {
    style: { top: '18%', right: '5%', width: 38, height: 38 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V11" />
        <path d="M19 21V11" />
        <path d="M5 11a7 7 0 0114 0" />
        <path d="M12 4v2" />
        <path d="M12 2l1 1-1 1-1-1 1-1z" fill="currentColor" />
        <path d="M9 21v-4a3 3 0 016 0v4" />
      </svg>
    ),
  },
  // Коран
  {
    style: { top: '35%', left: '2%', width: 28, height: 28 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
        <path d="M12 6v7" />
        <path d="M9 9.5l3-2 3 2" />
      </svg>
    ),
  },
  // Фонарь
  {
    style: { top: '8%', left: '22%', width: 24, height: 24 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2" />
        <path d="M10 4h4" />
        <path d="M8 6h8l1 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2V8l1-2z" />
        <path d="M12 10v4" />
        <path d="M10 12h4" />
        <path d="M12 18v2" />
      </svg>
    ),
  },
  // Четки
  {
    style: { top: '52%', right: '4%', width: 30, height: 30 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="4" r="2" />
        <circle cx="7" cy="7" r="1.5" />
        <circle cx="17" cy="7" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
        <circle cx="12" cy="20" r="2" />
      </svg>
    ),
  },
  // Звезда
  {
    style: { top: '68%', left: '6%', width: 26, height: 26 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1l2.09 6.26L20 9.27l-5.18 4.73L16.18 21 12 17.27 7.82 21l1.36-6.99L4 9.27l5.91-2.01L12 1z" />
      </svg>
    ),
  },
  // Полумесяц маленький
  {
    style: { top: '42%', right: '8%', width: 22, height: 22 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  // Финики
  {
    style: { top: '78%', right: '6%', width: 28, height: 28 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="8" cy="14" rx="3" ry="5" />
        <ellipse cx="16" cy="14" rx="3" ry="5" />
        <path d="M8 9c0-3 2-5 4-6 2 1 4 3 4 6" />
        <path d="M12 3v2" />
      </svg>
    ),
  },
  // Дополнительные маленькие иконки
  {
    style: { top: '88%', left: '4%', width: 20, height: 20 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
      </svg>
    ),
  },
  {
    style: { top: '25%', right: '2%', width: 18, height: 18 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1l2.09 6.26L20 9.27l-5.18 4.73L16.18 21 12 17.27 7.82 21l1.36-6.99L4 9.27l5.91-2.01L12 1z" />
      </svg>
    ),
  },
  {
    style: { top: '60%', left: '3%', width: 20, height: 20 },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v2M10 4h4M8 6h8l1 2v8a2 2 0 01-2 2h-6a2 2 0 01-2-2V8l1-2z" />
      </svg>
    ),
  },
  {
    style: { top: '32%', right: '3%', width: 24, height: 24 },
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
]

export default function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-emerald-500"
          style={{ ...item.style, opacity: 0.06 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.06,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.5, delay: index * 0.1 },
            y: {
              duration: 8 + index * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.3
            }
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  )
}
