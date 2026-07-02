import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAdminRole } from '../features/admin/useAdminRole'

const ALL_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true, adminOnly: false },
  { to: '/admin/products', icon: Package, label: 'Produits', adminOnly: true },
  { to: '/admin/categories', icon: Tag, label: 'Catégories', adminOnly: true },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Commandes', adminOnly: false },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs', adminOnly: true },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { isAdmin, role } = useAdminRole()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = ALL_NAV.filter((item) => !item.adminOnly || isAdmin)

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/connexion')
  }

  return (
    <div className="admin-root">
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-header">
          <span className="admin-logo">⬡ Sigidasugu</span>
          <button className="admin-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '8px 16px 10px', borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 11, color: '#334155', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
            Rôle
          </div>
          <span style={{
            display: 'inline-block', fontSize: 12, padding: '3px 10px', borderRadius: 99,
            background: isAdmin ? '#6366f122' : '#f59e0b22',
            color: isAdmin ? '#818cf8' : '#f59e0b',
            fontWeight: 600,
          }}>
            {role === 'admin' ? 'Admin' : 'Staff'}
          </span>
        </div>

        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="admin-topbar-title">Backoffice</span>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-root {
          display: flex; min-height: 100vh;
          background: #0f1117; color: #e2e8f0;
          font-family: system-ui, sans-serif;
        }
        .admin-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 40;
        }
        .admin-sidebar {
          width: 220px; min-width: 220px;
          background: #161b27; border-right: 1px solid #1e293b;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; z-index: 50;
          transition: transform .25s;
        }
        .admin-sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px 16px; border-bottom: 1px solid #1e293b;
        }
        .admin-logo { font-size: 16px; font-weight: 700; color: #6366f1; letter-spacing: .02em; }
        .admin-close-btn { display: none; background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; }
        .admin-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
        .admin-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 8px;
          color: #94a3b8; text-decoration: none; font-size: 14px;
          transition: background .15s, color .15s;
        }
        .admin-nav-item:hover { background: #1e293b; color: #e2e8f0; }
        .admin-nav-item.active { background: #1e1f3b; color: #818cf8; }
        .admin-logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 20px; background: none; border: none;
          color: #64748b; cursor: pointer; font-size: 14px;
          border-top: 1px solid #1e293b; width: 100%; transition: color .15s;
        }
        .admin-logout-btn:hover { color: #f87171; }
        .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .admin-topbar {
          background: #161b27; border-bottom: 1px solid #1e293b;
          padding: 0 20px; height: 56px;
          display: flex; align-items: center; gap: 14px;
          position: sticky; top: 0; z-index: 30;
        }
        .admin-menu-btn { display: none; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; }
        .admin-topbar-title { font-size: 15px; font-weight: 600; color: #e2e8f0; }
        .admin-content { padding: 24px; flex: 1; }
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed; left: 0; top: 0; transform: translateX(-100%); }
          .admin-sidebar.open { transform: none; }
          .admin-close-btn { display: block; }
          .admin-menu-btn { display: block; }
          .admin-content { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
