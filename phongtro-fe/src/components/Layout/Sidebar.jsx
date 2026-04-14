import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Users, FileText, Receipt, BarChart3, LogOut, Building2 } from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/rooms', label: 'Danh sách phòng', icon: Home },
  { path: '/tenants', label: 'Khách thuê', icon: Users },
  { path: '/contracts', label: 'Hợp đồng', icon: FileText },
  { path: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { path: '/reports', label: 'Thống kê', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 text-white shadow-2xl flex flex-col h-full">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <Building2 className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold tracking-wide">QL Phòng Trọ</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-5 border-t border-slate-700">
        <button className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition w-full text-sm">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}