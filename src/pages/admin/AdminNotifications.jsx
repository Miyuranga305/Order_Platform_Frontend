import { useEffect, useState } from "react";
import client from "../../api/client";
import { 
  FaBell, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaShoppingCart,
  FaUserPlus,
  FaFilter,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaTrash,
  FaCheck,
  FaTimes,
  FaArrowRight
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminNotifications() {
  const [data, setData] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (data?.content) {
      filterNotifications();
      countUnread();
    }
  }, [data, filter, searchTerm]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await client.get("/api/admin/notifications");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...(data?.content || [])];

    // Filter by type
    if (filter !== "all") {
      filtered = filtered.filter(n => n.eventType === filter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.orderId?.toString().includes(searchTerm) ||
        n.payload?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const countUnread = () => {
    const count = data.content.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const markAsRead = async (id) => {
    try {
      await client.put(`/api/admin/notifications/${id}/read`);
      setData(prev => ({
        ...prev,
        content: prev.content.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      }));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await client.put("/api/admin/notifications/read-all");
      setData(prev => ({
        ...prev,
        content: prev.content.map(n => ({ ...n, read: true }))
      }));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await client.delete(`/api/admin/notifications/${id}`);
      setData(prev => ({
        ...prev,
        content: prev.content.filter(n => n.id !== id)
      }));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'order_created':
        return <FaShoppingCart className="text-green-500" />;
      case 'order_updated':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'user_registered':
        return <FaUserPlus className="text-blue-500" />;
      case 'payment_received':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'order_created':
        return 'border-l-green-500 bg-green-50';
      case 'order_updated':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'user_registered':
        return 'border-l-blue-500 bg-blue-50';
      case 'payment_received':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <FaBell className="text-white text-2xl" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with system activities and events
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaCheck />
                Mark All Read
              </button>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Stats & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{data.content.length}</p>
                </div>
                <FaBell className="text-2xl text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaBell className="text-red-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.content.filter(n => {
                      const date = new Date(n.createdAt);
                      const today = new Date();
                      return date.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
                <FaCalendarAlt className="text-2xl text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last 7 Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.content.filter(n => {
                      const date = new Date(n.createdAt);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return date > weekAgo;
                    }).length}
                  </p>
                </div>
                <FaClock className="text-2xl text-gray-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                {['all', 'order_created', 'order_updated', 'user_registered', 'payment_received'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      filter === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                <FaBell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || filter !== 'all' 
                  ? "No notifications match your current filters"
                  : "All caught up! No notifications to show"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="space-y-4"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <div className={`bg-white rounded-xl border-l-4 ${getNotificationColor(notification.eventType)} ${notification.read ? 'opacity-75' : ''} shadow-sm border border-gray-200`}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                              {getNotificationIcon(notification.eventType)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {notification.eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h3>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    New
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 mb-4">
                                {notification.orderId && (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    <FaShoppingCart className="text-xs" />
                                    Order #{notification.orderId}
                                  </span>
                                )}
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">Event Data</span>
                                  <span className="text-xs text-gray-500">JSON Payload</span>
                                </div>
                                <pre className="text-sm text-gray-600 overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                                  {JSON.stringify(JSON.parse(notification.payload || '{}'), null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Mark as read"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          {notification.orderId && (
                            <a
                              href={`/orders/${notification.orderId}`}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Order"
                            >
                              <FaArrowRight />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}