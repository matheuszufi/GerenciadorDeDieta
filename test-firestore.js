// Teste simples para verificar conectividade do Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBtfIUURV0iZwk3afT6J7GORAD6Y9-H4vw",
  authDomain: "gerenciadordedieta.firebaseapp.com",
  projectId: "gerenciadordedieta",
  storageBucket: "gerenciadordedieta.firebasestorage.app",
  messagingSenderId: "390334831055",
  appId: "1:390334831055:web:a8790256f1d95a86605aba",
  measurementId: "G-1L3LWCXPY9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testFirestore() {
  try {
    console.log('🔵 Iniciando teste do Firestore...');
    
    // Primeiro, vamos autenticar anonimamente
    console.log('🔵 Fazendo autenticação anônima...');
    await signInAnonymously(auth);
    console.log('✅ Autenticação bem-sucedida');
    
    // Teste 1: Documento super simples
    console.log('🔵 Testando documento simples...');
    const simpleDoc = {
      test: 'hello',
      timestamp: new Date().toISOString(),
      number: 42
    };
    
    const docRef1 = await addDoc(collection(db, 'test'), simpleDoc);
    console.log('✅ Documento simples criado com ID:', docRef1.id);
    
    // Teste 2: Documento mais complexo (simulando um prato)
    console.log('🔵 Testando documento de prato...');
    const dishDoc = {
      name: 'Teste Prato',
      category: 'lunch',
      servings: 1,
      isPublic: false,
      ingredients: [
        {
          foodId: 'test-food-1',
          foodName: 'Arroz',
          quantity: 100,
          unit: 'g',
          nutrition: {
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3,
            fiber: 0.4,
            sodium: 5,
            sugar: 0.1,
            water: 68.4
          }
        }
      ],
      totalNutrition: {
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
        sodium: 5,
        sugar: 0.1,
        water: 68.4
      },
      nutritionPerServing: {
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3,
        fiber: 0.4,
        sodium: 5,
        sugar: 0.1,
        water: 68.4
      },
      userId: 'test-user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef2 = await addDoc(collection(db, 'test-dishes'), dishDoc);
    console.log('✅ Documento de prato criado com ID:', docRef2.id);
    
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Detalhes do erro:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

// Executar o teste
testFirestore();