import { Link, useLocation } from 'react-router-dom'
import { Home, Folder, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useProjectStore } from '@/stores/projectStore'
import { cn } from '@/lib/utils/cn'

export default function Sidebar() {
  const location = useLocation()
  const sidebarCollapsed = useWorkspaceStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useWorkspaceStore((state) => state.toggleSidebar)
  const currentProject = useProjectStore((state) => state.currentProject)

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/projects', icon: Folder, label: 'Projects' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-blue-600">GASS API</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Current Project Info */}
      {!sidebarCollapsed && currentProject && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Project Aktif</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentProject.name}
          </p>
        </div>
      )}
    </div>
  )
}
