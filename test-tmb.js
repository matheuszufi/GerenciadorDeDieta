// Teste da fórmula TMB (Mifflin-St Jeor)

function calculateTMB(age, weight, height, gender) {
  let tmb = 0
  
  if (gender === 'male') {
    // Homens: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) + 5
    tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    // Mulheres: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) - 161
    tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161
  }
  
  return Math.round(tmb)
}

// Teste com valores típicos
console.log('=== TESTE DA FÓRMULA TMB ===')

// Homem: 30 anos, 75kg, 175cm
const homem = calculateTMB(30, 75, 175, 'male')
console.log('Homem (30 anos, 75kg, 175cm):', homem, 'kcal/dia')

// Mulher: 25 anos, 60kg, 165cm  
const mulher = calculateTMB(25, 60, 165, 'female')
console.log('Mulher (25 anos, 60kg, 165cm):', mulher, 'kcal/dia')

// Homem jovem: 20 anos, 80kg, 180cm
const homemJovem = calculateTMB(20, 80, 180, 'male')
console.log('Homem jovem (20 anos, 80kg, 180cm):', homemJovem, 'kcal/dia')

// Cálculo manual para verificação:
console.log('\n=== VERIFICAÇÃO MANUAL ===')
console.log('Homem (30 anos, 75kg, 175cm):')
console.log('TMB = (10 × 75) + (6.25 × 175) - (5 × 30) + 5')
console.log('TMB = 750 + 1093.75 - 150 + 5 =', 750 + 1093.75 - 150 + 5)

console.log('\nMulher (25 anos, 60kg, 165cm):')
console.log('TMB = (10 × 60) + (6.25 × 165) - (5 × 25) - 161')
console.log('TMB = 600 + 1031.25 - 125 - 161 =', 600 + 1031.25 - 125 - 161)