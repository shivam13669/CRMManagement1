import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Truck,
  Users,
  Package,
  BarChart3,
  User,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  MapPin,
} from "lucide-react";
import { Button } from "./ui/button";

interface HospitalLayoutProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  relatedId?: number;
  createdAt: string;
}

const sidebarItems = [
  { icon: Activity, label: "Dashboard", path: "/hospital-dashboard" },
  { icon: Truck, label: "Ambulances", path: "/hospital-ambulances" },
  { icon: Users, label: "Staff Management", path: "/hospital-staff" },
  { icon: Package, label: "Inventory", path: "/hospital-inventory" },
  { icon: BarChart3, label: "Reports", path: "/hospital-reports" },
  { icon: User, label: "Profile", path: "/hospital-profile" },
  { icon: Settings, label: "Settings", path: "/hospital-settings" },
];

export function HospitalLayout({ children }: HospitalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const hospitalName = localStorage.getItem("hospitalName") || "Hospital";
  const userName = localStorage.getItem("userName") || "Administrator";

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: any) => n.unread).length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("hospitalName");
    window.location.href = "/login";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 z-30 h-full w-64 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Hospital
            </h1>
            <p className="text-xs text-gray-500 mt-1">{hospitalName}</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-100 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h2 className="text-2xl font-bold text-gray-800 hidden sm:block">
              {hospitalName}
            </h2>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-32"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b font-semibold">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-4 border-b">
                    <p className="font-medium text-sm">{userName}</p>
                    <p className="text-xs text-gray-500">Hospital Admin</p>
                  </div>
                  <Link
                    to="/hospital-profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/hospital-settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
