import { QueryProvider } from '@/lib/query-client'
import HomePage from '@/pages/HomePage'

function App() {
  return (
    <QueryProvider>
      <HomePage />
    </QueryProvider>
  )
}

export default App
