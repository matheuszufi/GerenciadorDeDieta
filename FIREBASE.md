# Firebase Integration - NutriPlan

## 🔥 Firebase Setup Completo

O projeto agora está integrado com Firebase Authentication, proporcionando autenticação real e segura.

### 🚀 Funcionalidades Implementadas

#### ✅ Firebase Authentication
- **Registro de usuários** com email e senha
- **Login** com credenciais reais
- **Logout** seguro
- **Recuperação de senha** via email
- **Persistência de sessão** automática
- **Monitoramento em tempo real** do estado de autenticação

#### ✅ Firestore Database (Configurado)
- Pronto para armazenar dados dos usuários
- Estrutura configurada para dados nutricionais

### 📝 Como Usar

#### 1. **Criar uma Nova Conta**
```
1. Acesse: http://localhost:5173/register
2. Preencha:
   - Nome completo
   - Email válido
   - Senha (mínimo 6 caracteres)
3. Clique em "Criar Conta"
4. Será redirecionado automaticamente para o dashboard
```

#### 2. **Fazer Login**
```
1. Acesse: http://localhost:5173/login
2. Use as credenciais da conta que você criou
3. Clique em "Entrar"
4. Será redirecionado para o dashboard
```

#### 3. **Recuperar Senha**
```
1. Na página de login, clique em "Esqueceu sua senha?"
2. Digite seu email
3. Verifique sua caixa de entrada para o link de redefinição
```

### 🔧 Configuração Técnica

#### Arquivos Principais
- `src/lib/firebase.ts` - Configuração do Firebase
- `src/contexts/AuthContext.tsx` - Context de autenticação
- `.env` - Variáveis de ambiente (opcional)

#### Firebase Services Configurados
```typescript
import { auth, db, analytics } from './lib/firebase'

// Authentication
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'

// Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore'
```

### 🛡️ Segurança

#### Regras de Firestore (Para implementar no Firebase Console)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Dados nutricionais por usuário
    match /users/{userId}/meals/{mealId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Regras de Authentication (No Firebase Console)
```
- Email/Password: Habilitado
- Recuperação de senha: Habilitada
- Verificação de email: Opcional
```

### 🎯 Próximos Passos Recomendados

#### 1. **Dados do Usuário no Firestore**
```typescript
// Salvar perfil do usuário
const saveUserProfile = async (userId: string, data: any) => {
  await setDoc(doc(db, 'users', userId), data)
}
```

#### 2. **Refeições e Dados Nutricionais**
```typescript
// Salvar refeição
const saveMeal = async (userId: string, mealData: any) => {
  await addDoc(collection(db, 'users', userId, 'meals'), mealData)
}
```

#### 3. **Verificação de Email**
```typescript
import { sendEmailVerification } from 'firebase/auth'

// Enviar verificação após registro
await sendEmailVerification(user)
```

### 🚀 Deploy

#### Preparação para Deploy
1. **Build do projeto**: `npm run build`
2. **Deploy no Firebase Hosting**: `firebase deploy`
3. **Configurar domínio personalizado** (opcional)

#### Variáveis de Ambiente para Produção
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
# ... outras configurações
```

### 📊 Monitoramento

O Firebase Analytics está configurado e coletará automaticamente:
- Eventos de autenticação
- Navegação de páginas
- Tempo de sessão
- Dados demográficos dos usuários

### 🆘 Troubleshooting

#### Erro comum: "Firebase project not found"
```bash
# Verifique se está usando o projeto correto
firebase use gerenciadordedieta
```

#### Erro de CORS
```javascript
// No Firebase Console > Authentication > Settings
// Adicione seu domínio às "Authorized domains"
```

---

## 🎉 Status: Firebase Totalmente Funcional!

✅ Autenticação real implementada
✅ Firestore configurado
✅ Analytics habilitado
✅ Variáveis de ambiente configuradas
✅ Tratamento de erros implementado
✅ UI atualizada para Firebase

**Teste agora:** http://localhost:5173