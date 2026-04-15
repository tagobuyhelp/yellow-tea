import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import adminAPI from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Mail, Phone, Calendar, MapPin, Edit, Trash2, Loader2, ChevronDown, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
    _id: string;
    name: string;
    email: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    role: string;
    addresses: Array<{
        line1?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
        _id: string;
    }>;
    created_at: string;
    updated_at: string;
    __v: number;
}

interface ApiParams {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
}

const AdminCustomers: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        isPhoneVerified: false,
        isEmailVerified: false,
        addresses: [{
            line1: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
        }],
    });
    const [formLoading, setFormLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Fetch customers
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const params: ApiParams = {
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined,
                role: selectedRole || undefined,
                isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
            };
        
            const response = await adminAPI.getAllCustomers(params);
    
            setCustomers(response.data.users || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('❌ Error fetching customers:', error);
            toast({
                title: "Error",
                description: "Failed to fetch customers",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, selectedRole, selectedStatus, toast]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearch = (value: string) => {
    
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleRoleChange = (value: string) => {
    
        setSelectedRole(value === 'all' ? '' : value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
    
        setSelectedStatus(value === 'all' ? '' : value);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
    
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
        setCurrentPage(1);
    };

    const handleEditCustomer = (customer: Customer) => {
    
        setSelectedCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            role: customer.role,
            isPhoneVerified: customer.isPhoneVerified,
            isEmailVerified: customer.isEmailVerified,
            addresses: customer.addresses.length > 0 ? [{
                line1: customer.addresses[0].line1 || "",
                city: customer.addresses[0].city || "",
                state: customer.addresses[0].state || "",
                pincode: customer.addresses[0].pincode || "",
                country: customer.addresses[0].country || "",
            }] : [{
                line1: "",
                city: "",
                state: "",
                pincode: "",
                country: "",
            }],
        });
        setIsEditDialogOpen(true);
    };

    const handleEditCustomerSubmit = async () => {
        try {
            setFormLoading(true);
    
            const response = await adminAPI.updateCustomer(selectedCustomer!._id, formData);
    

            toast({
                title: "Success",
                description: "Customer updated successfully",
            });

            setIsEditDialogOpen(false);
            setSelectedCustomer(null);
            fetchCustomers();
        } catch (error) {
            console.error('❌ Error updating customer:', error);
            toast({
                title: "Error",
                description: "Failed to update customer",
                variant: "destructive",
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteCustomer = async (customerId: string) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        try {
    
            const response = await adminAPI.deleteCustomer(customerId);
    

            toast({
                title: "Success",
                description: "Customer deleted successfully",
            });

            fetchCustomers();
        } catch (error) {
            console.error('❌ Error deleting customer:', error);
            toast({
                title: "Error",
                description: "Failed to delete customer",
                variant: "destructive",
            });
        }
    };

    const handleSort = (field: 'name' | 'email' | 'role' | 'createdAt') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedCustomers = React.useMemo(() => {
        return [...customers].sort((a, b) => {
            let aValue: string = a[sortBy] as string;
            let bValue: string = b[sortBy] as string;

            if (sortBy === 'createdAt') {
                aValue = new Date(aValue).toISOString();
                bValue = new Date(bValue).toISOString();
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [customers, sortBy, sortOrder]);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="destructive">Admin</Badge>;
            case 'customer':
                return <Badge variant="default">Customer</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
        ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
        );
    };

    if (loading && customers.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Customers</h2>
            </div>

            {/* Advanced Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <h3 className="font-semibold">Filters & Search</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-gray-600"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="search" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search Customers
                            </Label>
                            <div className="relative mt-1">
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
                        <div>
                            <Label htmlFor="role" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Role
                            </Label>
                            <Select value={selectedRole || 'all'} onValueChange={handleRoleChange}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="status" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Verified
                            </Label>
                            <Select value={selectedStatus || 'all'} onValueChange={handleStatusChange}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="not-verified">Not Verified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="flex items-center gap-2">
                                <ChevronDown className="h-4 w-4" />
                                Sort By
                            </Label>
                            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                                const [field, order] = value.split('-') as ['name' | 'email' | 'role' | 'createdAt', 'asc' | 'desc'];
                                setSortBy(field);
                                setSortOrder(order);
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                                    <SelectItem value="role-asc">Role (A-Z)</SelectItem>
                                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Customers Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Customers ({sortedCustomers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <button
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            <Users className="h-4 w-4" />
                                            Customer
                                            {sortBy === 'name' && (
                                                <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <button
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                            onClick={() => handleSort('email')}
                                        >
                                            <Mail className="h-4 w-4" />
                                            Email
                                            {sortBy === 'email' && (
                                                <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Verified
                                        </div>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <button
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                            onClick={() => handleSort('role')}
                                        >
                                            <Badge className="h-4 w-4" />
                                            Role
                                            {sortBy === 'role' && (
                                                <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Email Verified
                                        </div>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <button
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Joined
                                            {sortBy === 'createdAt' && (
                                                <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Location
                                        </div>
                                    </th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCustomers.map((customer) => (
                                    <tr key={customer._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <div>
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-sm text-gray-500">ID: {customer._id}</div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={customer.isPhoneVerified ? "default" : "secondary"}>
                                                    {customer.isPhoneVerified ? "Verified" : "Not Verified"}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {getRoleBadge(customer.role)}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={customer.isEmailVerified ? "default" : "secondary"}>
                                                    {customer.isEmailVerified ? "Verified" : "Not Verified"}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm">
                                                <div>{new Date(customer.created_at).toLocaleDateString()}</div>
                                                <div className="text-gray-500">{new Date(customer.created_at).toLocaleTimeString()}</div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {customer.addresses && customer.addresses.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" />
                                                    <span>{customer.addresses[0].city}, {customer.addresses[0].state}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditCustomer(customer)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCustomer(customer._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Customer Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update the customer details below and save your changes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Customer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-phone-verified">Phone Verified</Label>
                                <Select value={formData.isPhoneVerified ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, isPhoneVerified: value === 'yes' })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select verification status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Verified</SelectItem>
                                        <SelectItem value="no">Not Verified</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-email-verified">Email Verified</Label>
                            <Select value={formData.isEmailVerified ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, isEmailVerified: value === 'yes' })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select verification status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Verified</SelectItem>
                                    <SelectItem value="no">Not Verified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Primary Address</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-line1">Street Address</Label>
                                    <Input
                                        id="edit-line1"
                                        value={formData.addresses[0]?.line1 || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            addresses: [{
                                                ...formData.addresses[0],
                                                line1: e.target.value
                                            }]
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-city">City</Label>
                                    <Input
                                        id="edit-city"
                                        value={formData.addresses[0]?.city || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            addresses: [{
                                                ...formData.addresses[0],
                                                city: e.target.value
                                            }]
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-state">State</Label>
                                    <Input
                                        id="edit-state"
                                        value={formData.addresses[0]?.state || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            addresses: [{
                                                ...formData.addresses[0],
                                                state: e.target.value
                                            }]
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-pincode">Pincode</Label>
                                    <Input
                                        id="edit-pincode"
                                        value={formData.addresses[0]?.pincode || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            addresses: [{
                                                ...formData.addresses[0],
                                                pincode: e.target.value
                                            }]
                                        })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input
                                        id="edit-country"
                                        value={formData.addresses[0]?.country || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            addresses: [{
                                                ...formData.addresses[0],
                                                country: e.target.value
                                            }]
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={formLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditCustomerSubmit} disabled={formLoading}>
                            {formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Update Customer
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCustomers; 