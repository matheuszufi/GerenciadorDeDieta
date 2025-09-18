import React from 'react'
import CircularProgress from './CircularProgress'
import styles from './MacroProgress.module.css'

interface MacroData {
  consumed: number
  target: number
  calories?: number
  unit: string
  color: string
  label: string
}

interface MacroProgressProps {
  protein: MacroData
  carbs: MacroData
  fat: MacroData
  fiber?: MacroData
  sugar?: MacroData
  sodium?: MacroData
  calories: {
    consumed: number
    target: number
  }
  compact?: boolean
}

const MacroProgress: React.FC<MacroProgressProps> = ({
  protein,
  carbs,
  fat,
  fiber,
  sugar,
  sodium,
  calories,
  compact = false
}) => {
  const mainMacros = [
    { ...protein, key: 'protein' },
    { ...carbs, key: 'carbs' },
    { ...fat, key: 'fat' }
  ]

  const microMacros = [
    ...(fiber ? [{ ...fiber, key: 'fiber' }] : []),
    ...(sugar ? [{ ...sugar, key: 'sugar' }] : []),
    ...(sodium ? [{ ...sodium, key: 'sodium' }] : [])
  ]

  const caloriesPercentage = (calories.consumed / calories.target) * 100

  if (compact) {
    // Não mostrar calorias se for valores dummy (target = 1)
    const showCalories = calories.target > 1

    return (
      <div className={`${styles.compactContainer} ${!showCalories ? styles.noCalories : ''}`}>
        {showCalories && (
          <div className={styles.caloriesCompact}>
            <CircularProgress
              value={calories.consumed}
              max={calories.target}
              size={80}
              strokeWidth={6}
              label="Calorias"
              unit="kcal"
              gradient={true}
              animated={true}
            />
          </div>
        )}
        
        <div className={styles.macrosCompact}>
          {mainMacros.map((macro) => (
            <div key={macro.key} className={styles.macroCompactItem}>
              <div 
                className={styles.macroIndicator}
                style={{ backgroundColor: macro.color }}
              />
              <div className={styles.macroCompactInfo}>
                <span className={styles.macroCompactLabel}>{macro.label}</span>
                <span className={styles.macroCompactValue}>
                  {Math.round(macro.consumed)}/{Math.round(macro.target)}{macro.unit}
                </span>
              </div>
              <div className={styles.macroCompactBar}>
                <div 
                  className={styles.macroCompactProgress}
                  style={{ 
                    width: `${Math.min((macro.consumed / macro.target) * 100, 100)}%`,
                    backgroundColor: macro.color
                  }}
                />
              </div>
              <span className={styles.macroPercentage}>
                {Math.round((macro.consumed / macro.target) * 100)}%
              </span>
            </div>
          ))}
          
          {microMacros.length > 0 && (
            <div className={styles.microMacrosCompact}>
              {microMacros.map((macro) => (
                <div key={macro.key} className={styles.microMacroCompactItem}>
                  <div 
                    className={styles.macroIndicator}
                    style={{ backgroundColor: macro.color }}
                  />
                  <div className={styles.macroCompactInfo}>
                    <span className={styles.macroCompactLabel}>{macro.label}</span>
                    <span className={styles.macroCompactValue}>
                      {Math.round(macro.consumed)}/{Math.round(macro.target)}{macro.unit}
                    </span>
                  </div>
                  <div className={styles.macroCompactBar}>
                    <div 
                      className={styles.macroCompactProgress}
                      style={{ 
                        width: `${Math.min((macro.consumed / macro.target) * 100, 100)}%`,
                        backgroundColor: macro.color
                      }}
                    />
                  </div>
                  <span className={styles.macroPercentage}>
                    {Math.round((macro.consumed / macro.target) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.caloriesSection}>
        <CircularProgress
          value={calories.consumed}
          max={calories.target}
          size={160}
          strokeWidth={12}
          label="Calorias Totais"
          unit="kcal"
          gradient={true}
          animated={true}
        />
        
        <div className={styles.caloriesInfo}>
          <div className={styles.caloriesRemaining}>
            <span className={styles.remainingValue}>
              {Math.max(0, calories.target - calories.consumed)}
            </span>
            <span className={styles.remainingLabel}>kcal restantes</span>
          </div>
          
          <div className={styles.caloriesStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Meta</span>
              <span className={styles.statValue}>{Math.round(calories.target)} kcal</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Progresso</span>
              <span className={styles.statValue}>{Math.round(caloriesPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.macrosSection}>
        <h3 className={styles.macrosTitle}>Macronutrientes</h3>
        
        <div className={styles.macrosGrid}>
          {mainMacros.map((macro) => (
            <div key={macro.key} className={styles.macroCard}>
              <CircularProgress
                value={macro.consumed}
                max={macro.target}
                size={120}
                strokeWidth={8}
                label={macro.label}
                unit={macro.unit}
                animated={true}
              />
              
              <div className={styles.macroDetails}>
                {macro.calories && (
                  <div className={styles.macroCalories}>
                    <span className={styles.macroCaloriesValue}>
                      {Math.round(macro.calories)}
                    </span>
                    <span className={styles.macroCaloriesLabel}>kcal</span>
                  </div>
                )}
                
                <div className={styles.macroPercentage}>
                  {Math.round((macro.consumed / macro.target) * 100)}% da meta
                </div>
              </div>
            </div>
          ))}
        </div>

        {microMacros.length > 0 && (
          <>
            <h4 className={styles.microMacrosTitle}>Outros Nutrientes</h4>
            <div className={styles.microMacrosGrid}>
              {microMacros.map((macro) => (
                <div key={macro.key} className={styles.microMacroCard}>
                  <div className={styles.microMacroHeader}>
                    <span className={styles.microMacroLabel}>{macro.label}</span>
                    <span className={styles.microMacroValue}>
                      {Math.round(macro.consumed)}/{Math.round(macro.target)}{macro.unit}
                    </span>
                  </div>
                  <div className={styles.microMacroBar}>
                    <div 
                      className={styles.microMacroProgress}
                      style={{ 
                        width: `${Math.min((macro.consumed / macro.target) * 100, 100)}%`,
                        backgroundColor: macro.color
                      }}
                    />
                  </div>
                  <div className={styles.microMacroPercentage}>
                    {Math.round((macro.consumed / macro.target) * 100)}% da meta
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MacroProgress