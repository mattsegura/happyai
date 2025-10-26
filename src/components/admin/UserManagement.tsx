import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ADMIN_CONFIG } from '../../lib/config';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { ConfirmDialog } from './ConfirmDialog';
import {
  User,
  Search,
  Mail,
  Calendar,
  Shield,
  GraduationCap,
  UserCheck,
  Edit,
  Ban
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  total_points: number;
  current_streak: number;
  created_at: string;
  last_sign_in_at?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [disablingUser, setDisablingUser] = useState<UserProfile | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = ADMIN_CONFIG.USER_PAGE_SIZE;

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Build query with pagination
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply role filter at database level for efficiency
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      // Apply pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      // Error loading users - silent in production
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query (role filter is now applied at database level)
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Reset to page 1 when role filter changes
  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setCurrentPage(1);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'teacher':
        return GraduationCap;
      default:
        return UserCheck;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400';
      case 'teacher':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleDisableUser = async () => {
    if (!disablingUser) return;

    setDisabling(true);
    try {
      // For now, we'll just mark in a comment that this should disable the user
      // In production, you'd add a 'disabled' or 'status' column to profiles table

      // TODO: Implement actual disable logic when schema has status field
      // await supabase.from('profiles').update({ status: 'disabled' }).eq('id', disablingUser.id);

      alert('Disable user functionality requires a "status" column in profiles table. Add this column in Supabase to enable this feature.');
      setDisablingUser(null);
    } catch (err) {
      // Error disabling user - silent in production
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all users across the platform
          </p>
        </div>
        <Button
          onClick={() => setShowAddUserModal(true)}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <User className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleRoleFilterChange(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-[180px]"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Students</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter((u) => u.role === 'student').length}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Teachers</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter((u) => u.role === 'teacher').length}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-foreground">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/60 bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Streak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr
                      key={user.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {user.full_name || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                            getRoleColor(user.role)
                          )}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">
                          {user.total_points || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">
                          {user.current_streak || 0} days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            title="Edit user"
                            aria-label="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDisablingUser(user)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                            title="Disable user"
                            aria-label="Disable user"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <User className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        open={showAddUserModal}
        onOpenChange={setShowAddUserModal}
        onUserAdded={loadUsers}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={loadUsers}
          userId={editingUser.id}
          initialData={{
            email: editingUser.email,
            fullName: editingUser.full_name,
            role: editingUser.role,
          }}
        />
      )}

      {/* Disable User Confirmation */}
      {disablingUser && (
        <ConfirmDialog
          open={!!disablingUser}
          onOpenChange={(open) => !open && setDisablingUser(null)}
          onConfirm={handleDisableUser}
          title="Disable User"
          description={`Are you sure you want to disable ${disablingUser.full_name}? They will not be able to login until re-enabled.`}
          confirmText="Disable User"
          confirmVariant="destructive"
          loading={disabling}
        />
      )}
    </div>
  );
}
