import { Bell, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-md px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>
        <p className="text-sm text-gray-400">Chào mừng trở lại, Quản trị viên</p>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:text-blue-600 transition">
          <Bell size={22} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3">
          <UserCircle size={32} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}