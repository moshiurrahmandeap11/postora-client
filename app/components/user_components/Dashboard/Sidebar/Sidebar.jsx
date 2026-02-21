"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    FiFileText,
    FiHome,
    FiImage,
    FiLogOut,
    FiMessageSquare,
    FiPieChart,
    FiSettings,
    FiUsers,
    FiVideo,
    FiX
} from "react-icons/fi";

const Sidebar = ({ isOpen, onClose, user, onMenuItemClick }) => {
  const pathname = usePathname();
  const router = useRouter();

  // মেনু আইটেম
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/admin' },
    { id: 'users', label: 'Users', icon: FiUsers, path: '/dashboard/users' },
    { id: 'projects', label: 'Projects', icon: FiFileText, path: '/dashboard/projects' },
    { id: 'media', label: 'Media', icon: FiImage, path: '/admin/media' },
    { id: 'videos', label: 'Videos', icon: FiVideo, path: '/admin/videos' },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare, path: '/admin/messages' },
    { id: 'analytics', label: 'Analytics', icon: FiPieChart, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ];

  // লগআউট হ্যান্ডলার
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/signin');
  };

  // মেনু আইটেম ক্লিক হ্যান্ডলার
  const handleItemClick = (item) => {
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
    router.push(item.path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* মোবাইল ওভারলে */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* সাইডবার */}
      <aside className={`
        fixed pt-4 lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full
      `}>
        
        {/* সাইডবার হেডার */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
              Admin Panel
            </span>
          </Link>
          
          {/* ক্লোজ বাটন (মোবাইলে) */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ইউজার প্রোফাইল */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ন্যাভিগেশন মেনু */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                
                {/* নোটিফিকেশন ব্যাজ (ঐচ্ছিক) */}
                {item.id === 'messages' && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* লগআউট বাটন */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;