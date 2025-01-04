import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      <Header isAdmin={true} />
      <main className="max-w-7xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  )
} 