import { FaClock, FaBoxOpen, FaTruck, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <FaClock className="text-yellow-500" />
  },
  processing: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <FaBoxOpen className="text-blue-500" />
  },
  shipped: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <FaTruck className="text-purple-500" />
  },
  delivered: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <FaCheckCircle className="text-green-500" />
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <FaExclamationCircle className="text-red-500" />
  }
};

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status?.toLowerCase()] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${config.color}`}>
      {config.icon}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}