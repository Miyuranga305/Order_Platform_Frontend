import { useEffect, useState } from "react";
import client from "../api/client";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaTrash, 
  FaPrint, 
  FaDownload,
  FaShoppingBag,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaDollarSign,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaExclamationCircle
} from "react-icons/fa";
import { motion } from "framer-motion";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await client.delete(`/api/orders/${id}`);
      navigate("/orders");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'processing':
        return <FaBox className="text-blue-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <FaArrowLeft />
            Back to Orders
          </Link>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Order</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrderDetails}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <FaShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
            >
              <FaArrowLeft />
              Back to Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Print"
            >
              <FaPrint />
            </button>
            <button
              onClick={handleDelete}
              className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Order"
            >
              <FaTrash />
            </button>
          </div>
        </motion.div>

        {/* Order Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Order Progress</span>
              <span className="font-medium capitalize">{order.status}</span>
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
        </motion.div>

        {/* Customer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <FaUser className="text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Customer Name</div>
                <div className="font-medium">{order.customerName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-gray-400" />
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{order.customerEmail}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Order Placed</h4>
                <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${
                order.status === 'pending' || order.status === 'processing' || 
                order.status === 'shipped' || order.status === 'delivered'
                  ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <FaCalendarAlt className={`w-5 h-5 ${
                  order.status === 'pending' || order.status === 'processing' || 
                  order.status === 'shipped' || order.status === 'delivered'
                    ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Last Updated</h4>
                <p className="text-sm text-gray-600">{formatDate(order.updatedAt)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}