import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    toast.success('Berhasil logout')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Breadcrumb atau title bisa ditambahkan di sini */}
      </div>

      {/* User menu */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
