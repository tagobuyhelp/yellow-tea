import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, User, Mail, Calendar, Shield, Loader2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  created_at?: string;
  totalOrders?: number;
  addresses?: Array<{
    _id: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  }>;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formLoading, setFormLoading] = useState(false);

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];

  // Fetch users (mock data for now since we don't have a getAllUsers endpoint)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend endpoint is available
      // const response = await userAPI.getAllUsers();
      // setUsers(response.data);
      
      // Mock data for demonstration
      const mockUsers: UserData[] = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "user",
          phone: "+91 98765 43210",
          created_at: "2024-01-15T10:30:00Z",
          totalOrders: 5,
          addresses: [
            {
              _id: "addr1",
              line1: "123 Main St",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001",
              country: "India"
            }
          ]
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "admin",
          phone: "+91 98765 43211",
          created_at: "2024-01-10T14:20:00Z",
          totalOrders: 12,
          addresses: []
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "user",
          phone: "+91 98765 43212",
          created_at: "2024-01-20T09:15:00Z",
          totalOrders: 3,
          addresses: []
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleViewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleEditRole = (user: UserData) => {
    setEditingUser(user);
    setNewRole(user.role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // TODO: Uncomment when backend endpoint is available
      // await userAPI.updateUserRole(token, editingUser._id, newRole);
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      
      // Update local state
      setUsers(users.map(user => 
        user._id === editingUser._id 
          ? { ...user, role: newRole }
          : user
      ));
      
      setIsEditRoleOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // TODO: Uncomment when backend endpoint is available
      // await userAPI.deleteUser(token, userId);
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      // Update local state
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-500 text-white",
      user: "bg-blue-500 text-white",
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || "bg-gray-500 text-white"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const validateRoleForm = () => {
    const errors: { [key: string]: string } = {};
    if (!newRole.trim()) errors.role = 'Role is required.';
    return errors;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Users</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Joined</th>
                  <th className="text-left p-2">Orders</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="p-2">{getRoleBadge(user.role)}</td>
                    <td className="p-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(user.created_at || '')}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="font-medium">{user.totalOrders || 0}</span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user._id !== currentUser?._id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                    </div>
                    <div>
                      <Label>Joined</Label>
                      <p className="font-medium">{formatDate(selectedUser.created_at || '')}</p>
                    </div>
                    <div>
                      <Label>Total Orders</Label>
                      <p className="font-medium">{selectedUser.totalOrders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedUser.addresses.map((address) => (
                        <div key={address._id} className="p-4 border rounded">
                          <p>{address.line1}</p>
                          <p>{address.city}, {address.state} {address.pincode}</p>
                          <p>{address.country}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <p className="font-medium">{editingUser?.name}</p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.slice(1).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && <div className="text-red-500 text-xs mt-1">{formErrors.role}</div>}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditRoleOpen(false)} disabled={formLoading}>
                Cancel
              </Button>
              <Button onClick={async () => {
                const errors = validateRoleForm();
                setFormErrors(errors);
                if (Object.keys(errors).length > 0) return;
                setFormLoading(true);
                try {
                  await handleUpdateRole();
                } finally {
                  setFormLoading(false);
                }
              }} disabled={formLoading}>
                {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers; 