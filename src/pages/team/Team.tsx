// src/pages/team/Team.tsx

import "./team.css";
import { useEffect, useState } from "react";
import { getEmployees, createEmployee, updateEmployee, updateEmployeeStatus } from "./team.service";
import type { Employee } from "./team.service";
import { FaUsers, FaUserPlus, FaBoxes, FaChartLine, FaBullhorn, FaEnvelope, FaPhoneAlt, FaLock, FaEdit, FaToggleOn, FaToggleOff, FaUserShield, FaCheck, FaTimes } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────

type Role = "STOCK" | "SALES" | "MARKETING";

interface OnboardForm {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: Role;
}

interface EditForm {
  name: string;
  mobile: string;
  role: Role;
  password: string;
}

const EMPTY_ONBOARD: OnboardForm = { name: "", email: "", mobile: "", password: "", role: "STOCK" };
const EMPTY_EDIT: EditForm = { name: "", mobile: "", role: "STOCK", password: "" };

// ─── Sub-components ──────────────────────────────────────────────

function MetricCard({ icon, label, count, unit, description, colorClass }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  unit: string;
  description: string;
  colorClass: string;
}) {
  return (
    <div className="team-metric-box glass-panel">
      <div className={`metric-icon-wrap ${colorClass}`}>{icon}</div>
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <h2>{count} {unit}</h2>
        <span className="metric-desc">{description}</span>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group-custom">
      <label>{label}</label>
      {children}
    </div>
  );
}

function EmployeeRow({ emp, onEdit, onToggle }: {
  emp: Employee;
  onEdit: (emp: Employee) => void;
  onToggle: (emp: Employee) => void;
}) {
  const isAdmin = emp.role === "ADMIN";
  const status = emp.status ?? "ACTIVE";
  const role = emp.role ?? "STOCK";

  return (
    <tr className={status === "INACTIVE" ? "row-muted" : ""}>
      <td>
        <div className="employee-brief-cell">
          <div className="avatar-placeholder">{emp.name.charAt(0)}</div>
          <div className="employee-id-block">
            <strong>{emp.name}</strong>
            <span>{emp.email}</span>
          </div>
        </div>
      </td>
      <td><span className="mobile-cell-label">{emp.mobile || "N/A"}</span></td>
      <td>
        <span className={`role-badge-pill ${role.toLowerCase()}`}>
          {role === "ADMIN" ? "Master Admin" : `${role} Officer`}
        </span>
      </td>
      <td>
        <span className={`status-cell-pill ${status.toLowerCase()}`}>
          <span className="status-dot" />
          {status === "ACTIVE" ? "Active" : "On Hold"}
        </span>
      </td>
      <td>
        {isAdmin ? (
          <span className="restricted-text">System Protected</span>
        ) : (
          <button className={`toggle-action-btn ${status.toLowerCase()}`} onClick={() => onToggle(emp)} aria-label="Toggle Status">
            {status === "ACTIVE" ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        )}
      </td>
      <td>
        {isAdmin ? (
          <span className="restricted-text">—</span>
        ) : (
          <button className="edit-member-btn" onClick={() => onEdit(emp)} aria-label="Edit Profile">
            <FaEdit /> Edit
          </button>
        )}
      </td>
    </tr>
  );
}

function EditModal({ employee, form, onChange, onSave, onClose }: {
  employee: Employee;
  form: EditForm;
  onChange: (patch: Partial<EditForm>) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="edit-modal-backdrop">
      <div className="edit-modal-card glass-panel">
        <div className="modal-header">
          <FaUserShield className="modal-shield-icon" />
          <div>
            <h3>Edit Sub-Admin Profile</h3>
            <p>Editing profile for <strong>{employee.name}</strong>.</p>
          </div>
        </div>

        <form onSubmit={onSave}>
          <FormField label="Full Name">
            <input type="text" value={form.name} onChange={(e) => onChange({ name: e.target.value })} required />
          </FormField>

          <FormField label="Mobile Contact">
            <input type="tel" value={form.mobile} onChange={(e) => onChange({ mobile: e.target.value })} required />
          </FormField>

          <FormField label="Department Role">
            <RoleSelect value={form.role} onChange={(role) => onChange({ role })} />
          </FormField>

          <FormField label="New Password (leave blank to keep current)">
            <input type="password" placeholder="Enter new password..." value={form.password} onChange={(e) => onChange({ password: e.target.value })} />
          </FormField>

          <div className="modal-actions-footer">
            <button type="button" className="cancel-btn" onClick={onClose}><FaTimes /> Cancel</button>
            <button type="submit" className="save-btn"><FaCheck /> Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Role)}>
      <option value="STOCK">Stock Manager (Warehouse)</option>
      <option value="SALES">Sales Officer (Orders)</option>
      <option value="MARKETING">Marketing Officer (Recruiter)</option>
    </select>
  );
}

function OnboardModal({ form, onChange, onSave, onClose }: {
  form: OnboardForm;
  onChange: (patch: Partial<OnboardForm>) => void;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="edit-modal-backdrop">
      <div className="edit-modal-card glass-panel">
        <div className="modal-header">
          <FaUserPlus className="modal-shield-icon" />
          <div>
            <h3>Onboard Sub-Admin</h3>
            <p>Configure access and roles for new employees.</p>
          </div>
        </div>

        <form onSubmit={onSave}>
          <FormField label="Full Name">
            <input type="text" placeholder="e.g. Narendra Kumar" value={form.name} onChange={(e) => onChange({ name: e.target.value })} required />
          </FormField>

          <FormField label="Work Email">
            <div className="input-with-icon">
              <FaEnvelope />
              <input type="email" placeholder="username@gowmithra.com" value={form.email} onChange={(e) => onChange({ email: e.target.value })} required />
            </div>
          </FormField>

          <FormField label="Mobile Number">
            <div className="input-with-icon">
              <FaPhoneAlt />
              <input type="tel" placeholder="+91 98455 01234" value={form.mobile} onChange={(e) => onChange({ mobile: e.target.value })} required />
            </div>
          </FormField>

          <FormField label="Login Password">
            <div className="input-with-icon">
              <FaLock />
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => onChange({ password: e.target.value })} required />
            </div>
          </FormField>

          <FormField label="Department Role">
            <RoleSelect value={form.role} onChange={(role) => onChange({ role })} />
          </FormField>

          <div className="modal-actions-footer">
            <button type="button" className="cancel-btn" onClick={onClose}><FaTimes /> Cancel</button>
            <button type="submit" className="save-btn"><FaCheck /> Onboard</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function Team() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardForm, setOnboardForm] = useState<OnboardForm>(EMPTY_ONBOARD);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = () => {
    setIsLoading(true);
    getEmployees()
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          if (typeof a.id === 'number' && typeof b.id === 'number') {
            return a.id - b.id;
          }
          return String(a.id).localeCompare(String(b.id));
        });
        setEmployees(sorted);
      })
      .catch(() => toast.error("Failed to load team data."))
      .finally(() => setIsLoading(false));
  };

  const handleOnboard = (e: React.FormEvent) => {
    e.preventDefault();
    const loadToast = toast.loading("Registering employee...");
    createEmployee(onboardForm)
      .then(() => {
        toast.success("Employee onboarded!", { id: loadToast });
        setOnboardForm(EMPTY_ONBOARD);
        setIsOnboardModalOpen(false);
        loadEmployees();
      })
      .catch((err) => toast.error(err.message || "Failed to register employee.", { id: loadToast }));
  };

  const handleStatusToggle = (emp: Employee) => {
    const next = emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const loadToast = toast.loading("Updating status...");
    updateEmployeeStatus(emp.id, next)
      .then(() => {
        toast.success(`Account set to ${next === "ACTIVE" ? "Active" : "On Hold"}.`, { id: loadToast });
        loadEmployees();
      })
      .catch(() => toast.error("Status update failed.", { id: loadToast }));
  };

  const openEditModal = (emp: Employee) => {
    setEditTarget(emp);
    setEditForm({ name: emp.name, mobile: emp.mobile || "", role: emp.role as Role, password: "" });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const payload = {
      name: editForm.name,
      mobile: editForm.mobile,
      role: editForm.role,
      ...(editForm.password.trim() && { password: editForm.password }),
    };

    const loadToast = toast.loading("Saving changes...");
    updateEmployee(editTarget.id, payload)
      .then(() => {
        toast.success("Profile updated!", { id: loadToast });
        setEditTarget(null);
        loadEmployees();
      })
      .catch(() => toast.error("Profile update failed.", { id: loadToast }));
  };

  // Derived counts
  const counts = {
    total: employees.length,
    active: employees.filter((e) => (e.status ?? "ACTIVE") === "ACTIVE").length,
    stock: employees.filter((e) => e.role === "STOCK").length,
    sales: employees.filter((e) => e.role === "SALES").length,
    marketing: employees.filter((e) => e.role === "MARKETING").length,
  };

  return (
    <div className="team-page">
      <Toaster position="top-right" />

      <div className="team-top-bar">
        <h1 className="text-gradient">Team & Sub-Admins Directory</h1>
        <p>Create sub-admin accounts, manage roles, and control platform access.</p>
      </div>

      <div className="team-metrics-grid">
        <MetricCard icon={<FaUsers />} label="Total Sub-Admins" count={counts.total} unit="Total" description={`${counts.active} Currently Active`} colorClass="all" />
        <MetricCard icon={<FaBoxes />} label="Stock Storage Managers" count={counts.stock} unit="Managers" description="Manages inventory entries" colorClass="stock" />
        <MetricCard icon={<FaChartLine />} label="Sales Operations Clerks" count={counts.sales} unit="Representatives" description="Processes incoming farm orders" colorClass="sales" />
        <MetricCard icon={<FaBullhorn />} label="Marketing & Field Recruiters" count={counts.marketing} unit="Recruiters" description="Registers doctors & farmers" colorClass="marketing" />
      </div>

      <div>
        {/* Employee Table */}
        <div className="team-list-card glass-panel" style={{ marginTop: '24px' }}>
          <div className="card-header-block space-between">
            <div>
              <h3>Active Operations Team</h3>
              <p>Manage all registered sub-admin accounts.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span className="member-count-pill">{counts.total} Members</span>
              <button 
                onClick={() => setIsOnboardModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: 'var(--primary)', color: '#fff', border: 'none', 
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                  fontSize: '14px', transition: 'all 0.2s'
                }}
              >
                <FaUserPlus /> Add Employee
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="table-loading">Loading team data...</div>
          ) : (
            <div className="table-container-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Toggle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <EmployeeRow key={emp.id} emp={emp} onEdit={openEditModal} onToggle={handleStatusToggle} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isOnboardModalOpen && (
        <OnboardModal
          form={onboardForm}
          onChange={(patch) => setOnboardForm((p) => ({ ...p, ...patch }))}
          onSave={handleOnboard}
          onClose={() => setIsOnboardModalOpen(false)}
        />
      )}

      {editTarget && (
        <EditModal
          employee={editTarget}
          form={editForm}
          onChange={(patch) => setEditForm((p) => ({ ...p, ...patch }))}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}