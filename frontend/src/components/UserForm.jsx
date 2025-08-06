// src/components/UserForm.jsx
import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function UserForm({ user = null, onClose, onSaved }) {
  // === selectors (top-level hook calls) ===
  const createAdminUser = useAuthStore((s) => s.createAdminUser);
  const updateAdminUser = useAuthStore((s) => s.updateAdminUser);
  const adminLoading = useAuthStore((s) => s.adminLoading);

  // === form state ===
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // new password (optional for edit)
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setRole(user.role || "user");
      setPassword(""); // keep empty initially
    } else {
      setFullName("");
      setEmail("");
      setRole("user");
      setPassword("");
    }
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Name and email are required");
      return;
    }

    try {
      if (!user) {
        // create
        if (!password) {
          toast.error("Password is required for new user");
          return;
        }
        await createAdminUser({ fullName, email, password, role });
        toast.success("User created");
      } else {
        // update
        const payload = { fullName, email, role };
        if (password) payload.password = password;
        await updateAdminUser(user._id, payload);
        toast.success("User updated");
      }
      if (onSaved) onSaved();
    } catch (err) {
      console.error("save user error:", err);
      // create/update functions throw and show toasts; add fallback
      toast.error(err?.response?.data?.message || err?.message || "Save failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold mb-4">{user ? "Edit User" : "Add User"}</h3>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="input w-full"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="input w-full"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={user ? "Leave blank to keep password" : "Password"}
            type="password"
            className="input w-full"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="select w-full">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn" onClick={onClose} disabled={adminLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={adminLoading}>
              {adminLoading ? "Saving..." : user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
