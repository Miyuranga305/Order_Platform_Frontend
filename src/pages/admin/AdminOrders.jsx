import { useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaSortAmountDown,
  FaDownload,
  FaEye,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "NEW", label: "NEW" },
  { value: "PROCESSING", label: "PROCESSING" },
  { value: "COMPLETED", label: "COMPLETED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

function normalizeStatus(status) {
  return (status || "").toString().toUpperCase();
}

function getStatusBadgeClasses(status) {
  switch (normalizeStatus(status)) {
    case "NEW":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusIcon(status) {
  switch (normalizeStatus(status)) {
    case "NEW":
      return <FaClock className="text-yellow-600" />;
    case "PROCESSING":
      return <FaBoxOpen className="text-blue-600" />;
    case "COMPLETED":
      return <FaCheckCircle className="text-green-600" />;
    case "CANCELLED":
      return <FaExclamationCircle className="text-red-600" />;
    default:
      return <FaShoppingBag className="text-gray-500" />;
  }
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

export default function AdminOrders() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // "date" | "amount" | "customer"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      // If your backend supports pagination, prefer:
      // const res = await client.get("/api/admin/orders?page=0&size=50");
      const res = await client.get("/api/admin/orders");
      setData(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setData({ content: [] });
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ FIX: Use memo instead of setting state in effect (less bugs, no extra re-renders)
  const filteredOrders = useMemo(() => {
    const orders = data?.content || [];
    let filtered = [...orders];

    // Search
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((order) => {
        const idMatch = order.id?.toString().includes(term);
        const nameMatch = (order.customerName || "").toLowerCase().includes(term);
        const emailMatch = (order.customerEmail || "").toLowerCase().includes(term);
        return idMatch || nameMatch || emailMatch;
      });
    }

    // Status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => normalizeStatus(order.status) === normalizeStatus(statusFilter)
      );
    }

    // Date range
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate = new Date();

      if (dateFilter === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === "week") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
      }

      filtered = filtered.filter((order) => {
        if (!order.createdAt) return false;
        return new Date(order.createdAt) >= startDate;
      });
    }

    // Sorting (✅ FIXED asc/desc logic)
    filtered.sort((a, b) => {
      let valA, valB;

      if (sortBy === "date") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else if (sortBy === "amount") {
        valA = Number(a.totalAmount || 0);
        valB = Number(b.totalAmount || 0);
      } else if (sortBy === "customer") {
        valA = (a.customerName || "").toLowerCase();
        valB = (b.customerName || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const orders = data?.content || [];
    return {
      total: orders.length,
      revenue: orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
      newOrders: orders.filter((o) => normalizeStatus(o.status) === "NEW").length,
      completed: orders.filter((o) => normalizeStatus(o.status) === "COMPLETED").length,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[1, 2, 3].map((i) => (
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <FaShoppingBag className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all customer orders</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaShoppingBag className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.revenue)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FaChartLine className="text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NEW</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.newOrders}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaClock className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">COMPLETED</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="customer">Sort by Customer</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  title="Toggle sort order"
                >
                  <FaSortAmountDown className={sortOrder === "asc" ? "transform rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                <FaShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "No orders match your current filters"
                  : "No orders have been placed yet"}
              </p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  layout
                >
                  <Link to={`/orders/${order.id}`} className="group block">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                              {getStatusIcon(order.status)}
                            </div>

                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                                  Order #{order.id}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(
                                    order.status
                                  )}`}
                                >
                                  {getStatusIcon(order.status)}
                                  {normalizeStatus(order.status)}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <FaUser />
                                    {order.customerName || "-"}
                                  </span>
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <FaCalendarAlt />
                                    {formatDate(order.createdAt)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                  <span className="flex items-center gap-2 text-gray-600">
                                    <FaDollarSign />
                                    {formatCurrency(order.totalAmount)}
                                  </span>
                                  {order.items && (
                                    <span className="text-gray-600">
                                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500">Total</div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // TODO: export logic here if needed
                              }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Export"
                            >
                              <FaDownload />
                            </button>
                            <div className="text-gray-400" title="View">
                              <FaEye />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
