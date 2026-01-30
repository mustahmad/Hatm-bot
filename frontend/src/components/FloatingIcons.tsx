import { motion } from 'framer-motion'

// Исламские иконки для фона
const icons = [
  // Left side icons
  {
    position: 'left',
    top: '12%',
    // Полумесяц со звездой
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
        <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
        <circle cx="19" cy="5" r="1.5" />
      </svg>
    ),
  },
  {
    position: 'left',
    top: '35%',
    // Коран / Книга
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
        <path d="M12 6v7" />
        <path d="M9 9.5l3-2 3 2" />
      </svg>
    ),
  },
  {
    position: 'left',
    top: '58%',
    // Молитвенные четки (тасбих)
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
  {
    position: 'left',
    top: '80%',
    // Восьмиконечная звезда (исламский узор)
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
        <path d="M12 1l2.09 6.26L20 9.27l-5.18 4.73L16.18 21 12 17.27 7.82 21l1.36-6.99L4 9.27l5.91-2.01L12 1z" />
      </svg>
    ),
  },
  // Right side icons
  {
    position: 'right',
    top: '8%',
    // Фонарь (рамаданский)
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
  {
    position: 'right',
    top: '28%',
    // Мечеть (купол)
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
  {
    position: 'right',
    top: '50%',
    // Полумесяц
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    position: 'right',
    top: '72%',
    // Финики (рамадан)
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="8" cy="14" rx="3" ry="5" />
        <ellipse cx="16" cy="14" rx="3" ry="5" />
        <path d="M8 9c0-3 2-5 4-6 2 1 4 3 4 6" />
        <path d="M12 3v2" />
      </svg>
    ),
  },
]

export default function FloatingIcons() {
  return (
    <div className="floating-icons-container">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className={`floating-icon floating-icon--${item.position}`}
          style={{ top: item.top }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.15,
            duration: 0.6,
            ease: 'easeOut'
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  )
}
