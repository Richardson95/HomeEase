import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth, RequireRole } from './components/Guards'

import Home from './pages/Home'
import Search from './pages/Search'
import Saved from './pages/Saved'
import Messages from './pages/Messages'
import ChatThread from './pages/ChatThread'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import ListingDetail from './pages/ListingDetail'
import AddListing from './pages/AddListing'
import Inspections from './pages/Inspections'
import Wallet from './pages/Wallet'
import Loans from './pages/Loans'
import Admin from './pages/Admin'

import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Forgot from './pages/auth/Forgot'
import Verify from './pages/auth/Verify'

export default function App() {
  return (
    <Routes>
      {/* Standalone auth screens (no app chrome) */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot" element={<Forgot />} />

      {/* App shell */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/auth/verify" element={<RequireAuth><Verify /></RequireAuth>} />
        <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/messages/:threadId" element={<RequireAuth><ChatThread /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/list-property" element={<RequireAuth><AddListing /></RequireAuth>} />
        <Route path="/inspections" element={<RequireAuth><Inspections /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="/loans" element={<RequireAuth><Loans /></RequireAuth>} />
        <Route path="/admin" element={<RequireRole roles={['admin']}><Admin /></RequireRole>} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
