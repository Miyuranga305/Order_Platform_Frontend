import { useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import {
  FaUsers,
  FaUserShield,
  FaUser,
  FaSearch,
  FaSortAmountDown,
  FaCalendarAlt,
  FaUserCheck,
  FaUserPlus,
  FaTimesCircle,
  FaCheckCircle,
  FaPen,
  FaTrash,
} from "react-icons/fa";

export default function AdminUsers() {
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | ADMIN | USER
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await client.get("/api/admin/users");
        setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const users = useMemo(() => {
    const list = data?.content ?? [];
    const term = search.trim().toLowerCase();

    let filtered = [...list].map((u) => ({
      ...u,
      role: (u.role || "").toUpperCase(),
      // ✅ if backend doesn't have "active", default false so UI still works
      active: typeof u.active === "boolean" ? u.active : false,
    }));

    if (term) {
      filtered = filtered.filter((u) => {
        const name = (u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return (
          name.includes(term) ||
          email.includes(term) ||
          (u.id?.toString() || "").includes(term)
        );
      });
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) =>
        statusFilter === "active" ? u.active : !u.active
      );
    }

    // sort by name (like your UI)
    filtered.sort((a, b) => {
      const A = (a.fullName || "").toLowerCase();
      const B = (b.fullName || "").toLowerCase();
      if (A < B) return sortAsc ? -1 : 1;
      if (A > B) return sortAsc ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, search, roleFilter, statusFilter, sortAsc]);

  const stats = useMemo(() => {
    const list = (data?.content ?? []).map((u) => ({
      ...u,
      role: (u.role || "").toUpperCase(),
      active: typeof u.active === "boolean" ? u.active : false,
    }));

    const todayStr = new Date().toDateString();

    return {
      total: list.length,
      active: list.filter((u) => u.active).length,
      admins: list.filter((u) => u.role === "ADMIN").length,
      newToday: list.filter((u) => {
        if (!u.createdAt) return false;
        return new Date(u.createdAt).toDateString() === todayStr;
      }).length,
    };
  }, [data]);

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const badge = (role) => {
    if (role === "ADMIN")
      return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // ✅ UI-only toggle (works even if backend doesn't support it)
  const uiToggleActive = (id) => {
    setData((prev) => ({
      ...prev,
      content: (prev.content || []).map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      ),
    }));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
            <FaUsers className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Manage all system users and their permissions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={<FaUsers />}
            iconBg="bg-indigo-100"
            iconText="text-indigo-600"
          />
          <StatCard
            title="Active Users"
            value={stats.active}
            icon={<FaUserCheck />}
            iconBg="bg-green-100"
            iconText="text-green-600"
          />
          <StatCard
            title="Administrators"
            value={stats.admins}
            icon={<FaUserShield />}
            iconBg="bg-purple-100"
            iconText="text-purple-600"
          />
          <StatCard
            title="New Today"
            value={stats.newToday}
            icon={<FaUserPlus />}
            iconBg="bg-blue-100"
            iconText="text-blue-600"
          />
        </div>

        {/* Filters Row (matches your screenshot) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email, or phone..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-48 py-4 px-4 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 py-4 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => setSortAsc((s) => !s)}
              className="w-full md:w-14 h-14 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
              title="Sort"
            >
              <FaSortAmountDown className={sortAsc ? "" : "rotate-180"} />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              {/* top row */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {(u.fullName || "U").charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {u.fullName || "-"}
                      </h3>
                      <p className="text-gray-500">{u.email || "-"}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${badge(
                        u.role
                      )}`}
                    >
                      {u.role === "ADMIN" ? <FaUserShield /> : <FaUser />}
                      {u.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 mt-4">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="text-sm">
                      Joined {formatDate(u.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {u.active ? (
                      <span className="text-green-600 font-semibold flex items-center gap-2">
                        <FaCheckCircle />
                        Active
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold flex items-center gap-2">
                        <FaTimesCircle />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <hr className="my-5" />

              {/* actions row like your screenshot */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => uiToggleActive(u.id)}
                  className={`px-5 py-3 rounded-xl font-semibold ${
                    u.active
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {u.active ? "Deactivate" : "Activate"}
                </button>

                <div className="flex items-center gap-3">
                  <button className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                    <FaPen />
                  </button>
                  <button className="w-12 h-12 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            No users match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg, iconText }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg}`}>
          <div className={`text-xl ${iconText}`}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
