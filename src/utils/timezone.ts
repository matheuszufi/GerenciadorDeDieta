// Utility functions for Brazilian timezone handling

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

/**
 * Get current date in Brazilian timezone
 */
export const getBrazilianDate = (): Date => {
  // Create a date object that represents the current moment in Brazilian timezone
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  return brazilTime
}

/**
 * Get current date string in YYYY-MM-DD format for Brazilian timezone
 */
export const getBrazilianDateString = (): string => {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: BRAZIL_TIMEZONE })
  return formatter.format(now) // Returns YYYY-MM-DD format
}

/**
 * Format date to Brazilian timezone string
 */
export const formatBrazilianDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Format datetime to Brazilian timezone string
 */
export const formatBrazilianDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get date string in YYYY-MM-DD format for a specific date in Brazilian timezone
 */
export const formatDateString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: BRAZIL_TIMEZONE })
  return formatter.format(dateObj)
}

/**
 * Convert UTC date to Brazilian timezone
 */
export const utcToBrazilian = (utcDate: Date): Date => {
  return new Date(utcDate.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
}

/**
 * Get Brazilian time zone offset in hours
 */
export const getBrazilianTimezoneOffset = (): number => {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const brazil = new Date(utc.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  return (brazil.getTime() - utc.getTime()) / (1000 * 60 * 60)
}

/**
 * Check if a date string is today in Brazilian timezone
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getBrazilianDateString()
}

/**
 * Get yesterday's date in Brazilian timezone
 */
export const getYesterday = (): string => {
  const today = getBrazilianDate()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDateString(yesterday)
}

/**
 * Get tomorrow's date in Brazilian timezone
 */
export const getTomorrow = (): string => {
  const today = getBrazilianDate()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateString(tomorrow)
}

/**
 * Get week start date (Monday) in Brazilian timezone
 */
export const getWeekStart = (date?: Date | string): string => {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : getBrazilianDate()
  const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  
  const day = brazilDate.getDay()
  const diff = brazilDate.getDate() - day + (day === 0 ? -6 : 1) // Monday as start of week
  const monday = new Date(brazilDate.setDate(diff))
  
  return formatDateString(monday)
}

/**
 * Get week end date (Sunday) in Brazilian timezone
 */
export const getWeekEnd = (date?: Date | string): string => {
  const weekStart = getWeekStart(date)
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)
  
  return formatDateString(endDate)
}

/**
 * Get month start date in Brazilian timezone
 */
export const getMonthStart = (date?: Date | string): string => {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : getBrazilianDate()
  const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  
  const firstDay = new Date(brazilDate.getFullYear(), brazilDate.getMonth(), 1)
  return formatDateString(firstDay)
}

/**
 * Get month end date in Brazilian timezone
 */
export const getMonthEnd = (date?: Date | string): string => {
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : date) : getBrazilianDate()
  const brazilDate = new Date(dateObj.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
  
  const lastDay = new Date(brazilDate.getFullYear(), brazilDate.getMonth() + 1, 0)
  return formatDateString(lastDay)
}

/**
 * Get relative date string in Portuguese
 */
export const getRelativeDateString = (dateString: string): string => {
  const today = getBrazilianDateString()
  const yesterday = getYesterday()
  const tomorrow = getTomorrow()
  
  if (dateString === today) {
    return 'Hoje'
  } else if (dateString === yesterday) {
    return 'Ontem'
  } else if (dateString === tomorrow) {
    return 'Amanhã'
  } else {
    return formatBrazilianDate(dateString)
  }
}

/**
 * Generate date range array
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const current = new Date(start)
  while (current <= end) {
    dates.push(formatDateString(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Get days of current week in Brazilian timezone
 */
export const getCurrentWeekDays = (): string[] => {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()
  return getDateRange(weekStart, weekEnd)
}

/**
 * Get days of current month in Brazilian timezone
 */
export const getCurrentMonthDays = (): string[] => {
  const monthStart = getMonthStart()
  const monthEnd = getMonthEnd()
  return getDateRange(monthStart, monthEnd)
}