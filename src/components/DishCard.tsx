import React, { useState } from 'react'
import type { Dish } from '../hooks/useDishes'
import styles from './DishCard.module.css'

interface DishCardProps {
  dish: Dish
  onSelect?: (dish: Dish) => void
  onQuickAdd?: (dish: Dish, servings: number) => void
  variant?: 'default' | 'compact' | 'detailed'
  showNutrition?: boolean
  interactive?: boolean
}

const DishCard: React.FC<DishCardProps> = ({
  dish,
  onSelect,
  onQuickAdd,
  variant = 'default',
  showNutrition = true,
  interactive = true
}) => {
  const [servings, setServings] = useState(1)
  const [isExpanded, setIsExpanded] = useState(false)

  const getCategoryIcon = (category: string) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🍽️',
      dinner: '🌙',
      snack: '🥨',
      dessert: '🍰',
      beverage: '🥤',
      other: '📦'
    }
    return icons[category as keyof typeof icons] || '📦'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      breakfast: '#fbbf24',
      lunch: '#10b981',
      dinner: '#6366f1',
      snack: '#f59e0b',
      dessert: '#ec4899',
      beverage: '#06b6d4',
      other: '#6b7280'
    }
    return colors[category as keyof typeof colors] || '#6b7280'
  }

  const nutritionPerServing = {
    calories: Math.round((dish.nutritionPerServing.calories || 0) * servings),
    protein: Math.round((dish.nutritionPerServing.protein || 0) * servings * 10) / 10,
    carbs: Math.round((dish.nutritionPerServing.carbs || 0) * servings * 10) / 10,
    fat: Math.round((dish.nutritionPerServing.fat || 0) * servings * 10) / 10
  }

  const handleQuickAdd = () => {
    if (onQuickAdd) {
      onQuickAdd(dish, servings)
    }
  }

  const handleCardClick = () => {
    if (interactive && onSelect) {
      onSelect(dish)
    }
  }

  return (
    <div 
      className={`${styles.dishCard} ${styles[variant]} ${interactive ? styles.interactive : ''}`}
      onClick={handleCardClick}
    >
      {/* Header do Card */}
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryColor(dish.category) }}>
            <span className={styles.categoryIcon}>{getCategoryIcon(dish.category)}</span>
          </div>
          <div className={styles.titleInfo}>
            <h3 className={styles.dishName}>{dish.name}</h3>
            {dish.description && (
              <p className={styles.dishDescription}>{dish.description}</p>
            )}
          </div>
        </div>
        
        {dish.isPublic && (
          <div className={styles.publicBadge}>
            <span>🌐</span>
          </div>
        )}
      </div>

      {/* Informações Nutricionais */}
      {showNutrition && (
        <div className={styles.nutritionSection}>
          <div className={styles.primaryNutrition}>
            <div className={styles.caloriesDisplay}>
              <span className={styles.caloriesNumber}>{nutritionPerServing.calories}</span>
              <span className={styles.caloriesLabel}>kcal</span>
            </div>
            <div className={styles.servingsInfo}>
              <span className={styles.servingsText}>por {servings} porção{servings > 1 ? 'ões' : ''}</span>
            </div>
          </div>

          <div className={styles.macrosGrid}>
            <div className={styles.macroItem}>
              <span className={styles.macroIcon}>🥩</span>
              <span className={styles.macroValue}>{nutritionPerServing.protein}g</span>
              <span className={styles.macroLabel}>Prot</span>
            </div>
            <div className={styles.macroItem}>
              <span className={styles.macroIcon}>🍞</span>
              <span className={styles.macroValue}>{nutritionPerServing.carbs}g</span>
              <span className={styles.macroLabel}>Carb</span>
            </div>
            <div className={styles.macroItem}>
              <span className={styles.macroIcon}>🥑</span>
              <span className={styles.macroValue}>{nutritionPerServing.fat}g</span>
              <span className={styles.macroLabel}>Gord</span>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Ingredientes (Expandível) */}
      {variant === 'detailed' && (
        <div className={styles.ingredientsSection}>
          <button 
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            <span>Ingredientes ({dish.ingredients.length})</span>
            <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>▼</span>
          </button>
          
          {isExpanded && (
            <div className={styles.ingredientsList}>
              {dish.ingredients.slice(0, 3).map((ingredient, index) => (
                <div key={index} className={styles.ingredientItem}>
                  <span className={styles.ingredientName}>{ingredient.foodName}</span>
                  <span className={styles.ingredientAmount}>
                    {ingredient.quantity}{ingredient.unit}
                  </span>
                </div>
              ))}
              {dish.ingredients.length > 3 && (
                <div className={styles.moreIngredients}>
                  +{dish.ingredients.length - 3} mais
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controles de Ação */}
      {interactive && (
        <div className={styles.actionSection}>
          <div className={styles.servingsControl}>
            <button 
              className={styles.servingsButton}
              onClick={(e) => {
                e.stopPropagation()
                setServings(Math.max(0.5, servings - 0.5))
              }}
            >
              -
            </button>
            <span className={styles.servingsDisplay}>{servings}</span>
            <button 
              className={styles.servingsButton}
              onClick={(e) => {
                e.stopPropagation()
                setServings(servings + 0.5)
              }}
            >
              +
            </button>
          </div>
          
          {onQuickAdd && (
            <button 
              className={styles.addButton}
              onClick={(e) => {
                e.stopPropagation()
                handleQuickAdd()
              }}
            >
              Adicionar
            </button>
          )}
        </div>
      )}

      {/* Indicator de última utilização */}
      <div className={styles.metaInfo}>
        <span className={styles.servingsTotal}>
          Rende {dish.servings} porção{dish.servings > 1 ? 'ões' : ''}
        </span>
      </div>
    </div>
  )
}

export default DishCard