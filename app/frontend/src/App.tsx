import React from 'react'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { ClientLayout } from './layouts/ClientLayout'
import { useWallet } from '@solana/wallet-adapter-react'
import { AdminDashboard } from './pages/admin/Dashboard'
import { StakeShiftInterface } from './components/stake-shift-interface'
import { TransactionHistory } from './components/transaction-history'
import { UserProvider } from './contexts/UserContext'
import { AccountPage } from './pages/account'

function App() {
  const { publicKey } = useWallet()
  const isAdmin = true

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<StakeShiftInterface />} />
            <Route path="history" element={<TransactionHistory />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}

export default App
