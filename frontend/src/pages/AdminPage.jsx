// src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore"; // default export assumed
import UserForm from "../components/UserForm";
import toast from "react-hot-toast";

export default function AdminPage() {
  // === Hook selectors (top level) ===
  const fetchAdminUsers = useAuthStore((s) => s.fetchAdminUsers);
  const deleteAdminUser = useAuthStore((s) => s.deleteAdminUser);
  const adminUsers = useAuthStore((s) => s.adminUsers);
  const adminLoading = useAuthStore((s) => s.adminLoading);

  // === Local UI state ===
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Load users (uses the function above, not a hook)
  const loadUsers = async () => {
    try {
      await fetchAdminUsers({ page: 1, limit: 100, q: query });
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run on mount

  const onDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteAdminUser(id);
      toast.success("User deleted");
      // store update is optimistic; no reload needed
    } catch (err) {
      console.error("delete error", err);
      toast.error("Delete failed");
    }
  };

  const onOpenCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const onOpenEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const onFormClose = (saved) => {
    setShowForm(false);
    setEditingUser(null);
    if (saved) loadUsers(); // refresh after create/update if needed
  };

  return (
    <div className="p-4 pt-20">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin — Manage Users</h1>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="input input-sm input-bordered"
          />
          <button className="btn btn-sm" onClick={() => loadUsers()}>
            Search
          </button>
          <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>
            Add User
          </button>
        </div>
      </div>

      {adminLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers && adminUsers.length > 0 ? (
                adminUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="flex gap-2">
                      <button className="btn btn-xs" onClick={() => onOpenEdit(u)}>
                        Edit
                      </button>
                      <button className="btn btn-xs btn-error" onClick={() => onDelete(u._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => onFormClose(false)}
          onSaved={() => onFormClose(true)}
        />
      )}
    </div>
  );
}
