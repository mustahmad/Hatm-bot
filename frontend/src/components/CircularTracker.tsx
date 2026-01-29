import { motion } from 'framer-motion'
import { JuzAssignment } from '../api/client'

interface CircularTrackerProps {
  juzAssignments: JuzAssignment[]
  size?: number
  onJuzClick?: (juz: JuzAssignment) => void
}

export default function CircularTracker({
  juzAssignments,
  size = 280,
  onJuzClick
}: CircularTrackerProps) {
  const totalJuzs = 30
  const completedJuzs = juzAssignments.filter(j => j.status === 'completed').length
  const debtJuzs = juzAssignments.filter(j => j.status === 'debt' || j.is_debt).length
  const progressPercent = Math.round((completedJuzs / totalJuzs) * 100)

  const radius = (size - 40) / 2
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 20

  // Calculate stroke dasharray for progress
  const completedLength = (completedJuzs / totalJuzs) * circumference
  const debtLength = (debtJuzs / totalJuzs) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Completed progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#greenGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - completedLength }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Debt arc (after completed) */}
        {debtJuzs > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - completedLength - debtLength}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              transform: `rotate(${(completedJuzs / totalJuzs) * 360}deg)`,
              transformOrigin: 'center'
            }}
          />
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          className="text-center"
        >
          <div className="text-5xl font-bold text-gray-800">
            {progressPercent}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {completedJuzs} из {totalJuzs} джузов
          </div>
        </motion.div>
      </div>

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(16, 185, 129, ${progressPercent / 400}) 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}
