import React, { useState } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const FirestoreTest: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSimpleDocument = async () => {
    setIsLoading(true);
    try {
      addResult('🔵 Testando documento simples...');
      
      const simpleDoc = {
        test: 'hello world',
        timestamp: new Date().toISOString(),
        number: 42,
        userId: user?.id || 'anonymous'
      };
      
      const docRef = await addDoc(collection(db, 'test_simple'), simpleDoc);
      addResult(`✅ Documento simples criado: ${docRef.id}`);
      
    } catch (error: any) {
      addResult(`❌ Erro no documento simples: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDishDocument = async () => {
    setIsLoading(true);
    try {
      addResult('🔵 Testando documento de prato...');
      
      const dishDoc = {
        name: 'Prato Teste',
        category: 'lunch',
        servings: 1,
        isPublic: false,
        ingredients: [
          {
            foodId: 'test-food',
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
        userId: user?.id || 'test-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'test_dishes'), dishDoc);
      addResult(`✅ Documento de prato criado: ${docRef.id}`);
      
    } catch (error: any) {
      addResult(`❌ Erro no documento de prato: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithSetDoc = async () => {
    setIsLoading(true);
    try {
      addResult('🔵 Testando com setDoc...');
      
      const testId = `test_${Date.now()}`;
      const testDoc = {
        name: 'Teste SetDoc',
        timestamp: new Date().toISOString(),
        userId: user?.id || 'test-user'
      };
      
      await setDoc(doc(db, 'test_setdoc', testId), testDoc);
      addResult(`✅ SetDoc bem-sucedido: ${testId}`);
      
    } catch (error: any) {
      addResult(`❌ Erro no setDoc: ${error.message}`);
      console.error('Erro completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
        <h3>🔒 Teste do Firestore - Usuário não autenticado</h3>
        <p>Faça login para testar o Firestore</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🧪 Teste do Firestore</h3>
      <p><strong>Usuário:</strong> {user.email} ({user.id})</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSimpleDocument} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Teste Documento Simples
        </button>
        
        <button 
          onClick={testDishDocument} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Teste Documento Prato
        </button>
        
        <button 
          onClick={testWithSetDoc} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Teste SetDoc
        </button>
        
        <button 
          onClick={clearResults}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white' }}
        >
          Limpar
        </button>
      </div>
      
      {isLoading && <p>⏳ Executando teste...</p>}
      
      <div style={{ 
        maxHeight: '300px', 
        overflow: 'auto', 
        backgroundColor: '#f8f9fa', 
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {results.length === 0 ? (
          <p>Nenhum teste executado ainda.</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FirestoreTest;