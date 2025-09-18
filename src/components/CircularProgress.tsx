import React, { useEffect, useState } from 'react'
import styles from './CircularProgress.module.css'

interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  backgroundColor?: string
  label?: string
  unit?: string
  showPercentage?: boolean
  animated?: boolean
  gradient?: boolean
  children?: React.ReactNode
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  backgroundColor = '#e5e7eb',
  label,
  unit,
  showPercentage = false,
  animated = true,
  gradient = false,
  children
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((value / max) * 100, 100)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedValue(percentage)
    }
  }, [percentage, animated])

  const getColor = () => {
    if (gradient) {
      return 'url(#gradient)'
    }
    
    // Cores baseadas no progresso
    if (percentage >= 90 && percentage <= 110) return '#10b981' // Verde
    if (percentage >= 70 && percentage < 90) return '#f59e0b' // Amarelo
    if (percentage > 110) return '#ef4444' // Vermelho
    return '#6b7280' // Cinza
  }

  const formatValue = (val: number) => {
    if (val < 10) return val.toFixed(1)
    return Math.round(val)
  }

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {gradient && (
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        )}
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className={styles.backgroundCircle}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={animated ? circumference - (animatedValue / 100) * circumference : strokeDashoffset}
          strokeLinecap="round"
          className={`${styles.progressCircle} ${animated ? styles.animated : ''}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      
      <div className={styles.content}>
        {children || (
          <>
            <div className={styles.valueContainer}>
              <span className={styles.value}>
                {showPercentage ? `${Math.round(percentage)}%` : formatValue(value)}
              </span>
              {unit && !showPercentage && (
                <span className={styles.unit}>{unit}</span>
              )}
            </div>
            
            {!showPercentage && (
              <div className={styles.target}>
                de {formatValue(max)}{unit}
              </div>
            )}
            
            {label && (
              <div className={styles.label}>{label}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CircularProgress