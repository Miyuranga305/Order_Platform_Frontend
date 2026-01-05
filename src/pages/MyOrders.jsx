import { useEffect, useState } from "react";
import client from "../api/client";
import { Link } from "react-router-dom";
import { 
  FaPlus, 
  FaShoppingBag, 
  FaClock, 
  FaCheckCircle, 
  FaTruck, 
  FaBoxOpen,
  FaExclamationCircle,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaDownload
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import OrderStatusBadge from "../components/OrderStatusBadge";
import EmptyState from "../components/EmptyState";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await client.get("/api/orders/my");
      setOrders(response.data.content || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.totalAmount?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case "amount":
          comparison = b.totalAmount - a.totalAmount;
          break;
        case "status":
          const statusOrder = { pending: 1, processing: 2, shipped: 3, delivered: 4, cancelled: 5 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
    });

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaBoxOpen className="text-blue-500" />;
      case 'shipped':
        return <FaTruck className="text-purple-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return <FaShoppingBag className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">
                Track and manage all your orders in one place
              </p>
            </div>
            <Link
              to="/orders/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <FaPlus className="text-sm" />
              <span>New Order</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  statusFilter === status
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    statusFilter === status ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {count}
                  </div>
                  <div className="text-sm font-medium text-gray-600 capitalize mt-1">
                    {status}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, status, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaSortAmountDown className={sortOrder === "asc" ? "transform rotate-180" : ""} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<FaShoppingBag className="w-16 h-16" />}
              title="No orders found"
              description={orders.length === 0 
                ? "You haven't placed any orders yet. Start shopping!"
                : "No orders match your current filters."
              }
              action={
                orders.length === 0 && (
                  <Link
                    to="/orders/new"
                    className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <FaPlus />
                    Create Your First Order
                  </Link>
                )
              }
            />
          ) : (
            <motion.div
              layout
              className="grid gap-4"
            >
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <Link
                    to={`/orders/${order.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left side - Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                              {getStatusIcon(order.status)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                  Order #{order.id}
                                </h3>
                                <OrderStatusBadge status={order.status} />
                                <span className="text-sm text-gray-500">
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                              
                              {order.items && (
                                <p className="text-gray-600 mb-2">
                                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <FaDollarSign />
                                  {formatCurrency(order.totalAmount)}
                                </span>
                                <span className="flex items-center gap-1 text-gray-500">
                                  <FaCalendarAlt />
                                  Placed on {formatDate(order.createdAt)}
                                </span>
                                {order.estimatedDelivery && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <FaTruck />
                                    Est. delivery: {formatDate(order.estimatedDelivery)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions & Details */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Total Amount
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // Handle download invoice
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Download Invoice"
                            >
                              <FaDownload />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // Quick view action
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Quick View"
                            >
                              <FaEye />
                            </button>
                            <FaChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar for order status */}
                      {order.status && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Order Progress</span>
                            <span className="font-medium">{order.status}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                order.status === 'pending' ? 'w-1/4 bg-yellow-500' :
                                order.status === 'processing' ? 'w-1/2 bg-blue-500' :
                                order.status === 'shipped' ? 'w-3/4 bg-purple-500' :
                                order.status === 'delivered' ? 'w-full bg-green-500' :
                                'w-full bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <p className="text-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                  )}
                </div>
                <p className="text-gray-600">Total value of displayed orders</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}