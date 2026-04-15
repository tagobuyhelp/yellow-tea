import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Address } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Heart, 
  CreditCard, 
  Settings,
  Edit3,
  Calendar,
  Star,
  Truck,
  Gift,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Save,
  Eye,
  Copy,
  User as UserIcon
} from 'lucide-react';
import { userAPI } from '@/services/auth';

// Define types for dynamic data


type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  dateJoined: string;
  totalOrders: number;
  favoriteTeaType: string;
  addresses?: Address[];
};

type UserOrder = {
  _id: string;
  orderNumber?: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    image?: string;
    price: number;
    product: string;
    _id: string;
  }>;
  totalPrice: number;
  orderStatus?: string;
  created_at: string;
};

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setUserProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: '',
        dateJoined: user.created_at || '',
        totalOrders: user.totalOrders || 0,
        favoriteTeaType: user.favoriteTeaType || '',
        addresses: user.addresses || [],
      });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await userAPI.getOrders(token);
  
          if (res.success && Array.isArray(res.data)) {
            setOrders(res.data);
            // Update total orders count based on actual orders
            setUserProfile(prev => prev ? {
              ...prev,
              totalOrders: res.data.length
            } : null);
          } else {
            setOrders([]);
            setUserProfile(prev => prev ? {
              ...prev,
              totalOrders: 0
            } : null);
          }
        } catch {
          setOrders([]);
          setUserProfile(prev => prev ? {
            ...prev,
            totalOrders: 0
          } : null);
        }
      } else {
        setOrders([]);
        setUserProfile(prev => prev ? {
          ...prev,
          totalOrders: 0
        } : null);
      }
      setOrdersLoading(false);
    };
    fetchOrders();
  }, []);

  // Restore wishlistItems from user object
  const wishlistItems = useMemo(() => (user && user.wishlist) || [], [user]);

  // Only use orders and recentActivity for dynamic data
  const recentActivity = useMemo(() => (user && user.recentActivity) || [], [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    // Validation
    if (!newAddress.line1.trim()) {
      alert('Address line is required');
      return;
    }
    if (!newAddress.city.trim()) {
      alert('City is required');
      return;
    }
    if (!newAddress.state.trim()) {
      alert('State is required');
      return;
    }
    if (!newAddress.pincode.trim()) {
      alert('Pincode is required');
      return;
    }
    if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      alert('Pincode must be 6 digits');
      return;
    }
    if (!newAddress.country.trim()) {
      alert('Country is required');
      return;
    }

    // Map to backend-required fields
    const addressToSend = {
      line1: newAddress.line1.trim(),
      city: newAddress.city.trim(),
      state: newAddress.state.trim(),
      pincode: newAddress.pincode.trim(),
      country: newAddress.country.trim(),
    };

    // Call backend to add address
    const res = await userAPI.addAddress(token, addressToSend);
    if (res.success) {
      setUserProfile({
        ...userProfile,
        addresses: res.data.addresses || userProfile.addresses,
      });
      setShowAddAddress(false);
      setNewAddress({
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      });
    } else {
      alert(res.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const token = localStorage.getItem('token');
    if (!token || !userProfile) return;
    const res = await userAPI.deleteAddress(token, addressId);
    if (res.success) {
      setUserProfile({
        ...userProfile,
        addresses: res.data.addresses || userProfile.addresses.filter(addr => addr._id !== addressId),
      });
    } else {
      alert(res.message || 'Failed to delete address');
    }
  };

  const handleEditAddress = async (e: React.FormEvent, addressId: string) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !userProfile) return;
    // Remove the old address, add the updated one
    const updatedAddresses = userProfile.addresses
      .filter(addr => addr._id !== addressId)
      .concat([{ ...editAddress, _id: addressId }]);
    // Send the updated address as a new address (since no update endpoint)
    const res = await userAPI.addAddress(token, editAddress);
    if (res.success) {
      setUserProfile({
        ...userProfile,
        addresses: res.data.addresses || updatedAddresses,
      });
      setEditingAddressId(null);
    } else {
      alert(res.message || 'Failed to update address');
    }
  };

  if (loading || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save logic would go here
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state if userProfile is not loaded yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-20">
        <div className="sticky top-0 z-30 bg-background">
          <Header />
        </div>
        <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background">
        <Header />
      </div>
      <div className="container mx-auto px-2 py-4 md:px-4 md:py-8">
        {/* Profile Header */}
        <div className="mb-4 md:mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback className="text-lg md:text-2xl">
                      {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 h-7 w-7 md:h-8 md:w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
                    <div>
                      <h1 className="text-lg md:text-2xl font-bold">{userProfile.name}</h1>
                      <p className="text-xs md:text-sm text-muted-foreground">{userProfile.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Tea enthusiast since {userProfile.dateJoined ? new Date(userProfile.dateJoined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <Button 
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "default" : "outline"}
                      size="sm"
                    >
                      {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                      {isEditing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4 mt-4 md:mt-6">
                    <div className="bg-primary/10 rounded-lg p-2 md:p-3 text-center">
                      <div className="text-lg md:text-2xl font-bold text-primary">{userProfile.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">Total Orders</div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2 md:p-3 text-center">
                      <div className="text-lg md:text-2xl font-bold text-green-600">{wishlistItems.length}</div>
                      <div className="text-xs text-muted-foreground">Wishlist Items</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sticky Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="sticky top-[56px] z-20 bg-background pb-2 md:pb-4 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[350px] md:min-w-[500px]">
              <TabsTrigger value="overview" className="text-xs md:text-sm px-1 md:px-4">Overview</TabsTrigger>
              <TabsTrigger value="orders" className="text-xs md:text-sm px-1 md:px-4">Orders</TabsTrigger>
              <TabsTrigger value="addresses" className="text-xs md:text-sm px-1 md:px-4">Addresses</TabsTrigger>
              <TabsTrigger value="wishlist" className="text-xs md:text-sm px-1 md:px-4">Wishlist</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm px-1 md:px-4">Settings</TabsTrigger>
            </TabsList>
          </div>
          {/* Main Content Tabs */}
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={userProfile.name} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={userProfile.email} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={userProfile.phone} 
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tea Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2" />
                    Tea Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Favorite Tea Type</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                        <SelectValue placeholder={userProfile.favoriteTeaType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green Tea</SelectItem>
                        <SelectItem value="black">Black Tea</SelectItem>
                        <SelectItem value="masala">Masala Chai</SelectItem>
                        <SelectItem value="herbal">Herbal Tea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Brewing Strength</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="strong">Strong</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Frequency</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger className={!isEditing ? "bg-muted" : ""}>
                        <SelectValue placeholder="Monthly" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>

                {ordersLoading ? (
                  <p className="text-center text-muted-foreground">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted-foreground">No orders yet.</p>
                ) : orders.map((order, idx) => (
                    <div key={order._id} className="border rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={order.orderItems[0]?.image || '/placeholder.svg'} 
                            alt="Order" 
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <p className="font-semibold">Order {order.orderNumber || order._id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.orderItems.length} items • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                          <Badge className={getStatusColor(order.orderStatus)}>
                            {order.orderStatus || 'Unknown'}
                          </Badge>
                          <p className="font-semibold">₹{order.totalPrice}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/order/${order._id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/track-order/${order._id}`)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                        {order.orderStatus && order.orderStatus.toLowerCase() === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <Package className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Saved Addresses
                  </span>
                  <Button size="sm" onClick={() => setShowAddAddress(true)}>Add Address</Button>
                </CardTitle>
              </CardHeader>
              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="space-y-2 border rounded-lg p-4 mt-4">
                  <Input placeholder="Address Line 1" value={newAddress.line1} onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })} required />
                  <Input placeholder="Address Line 2" value={newAddress.line2} onChange={e => setNewAddress({ ...newAddress, line2: e.target.value })} />
                  <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                  <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                  <Input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} required />
                  <Input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} required />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                  </div>
                </form>
              )}
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {userProfile.addresses?.map((address: Address) => (
                    <div key={address._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={address.isDefault ? "default" : "secondary"}>
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>{address.city}, {address.state}</p>
                        <p>{address.pincode}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {editingAddressId === address._id ? (
                          <form onSubmit={e => handleEditAddress(e, address._id)} className="space-y-2 mb-2">
                            <Input placeholder="Address Line 1" value={editAddress.line1} onChange={e => setEditAddress({ ...editAddress, line1: e.target.value })} required />
                            <Input placeholder="City" value={editAddress.city} onChange={e => setEditAddress({ ...editAddress, city: e.target.value })} required />
                            <Input placeholder="State" value={editAddress.state} onChange={e => setEditAddress({ ...editAddress, state: e.target.value })} required />
                            <Input placeholder="Pincode" value={editAddress.pincode} onChange={e => setEditAddress({ ...editAddress, pincode: e.target.value })} required />
                            <Input placeholder="Country" value={editAddress.country} onChange={e => setEditAddress({ ...editAddress, country: e.target.value })} required />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">Save</Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => setEditingAddressId(null)}>Cancel</Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingAddressId(address._id);
                              setEditAddress({
                                line1: address.line1,
                                city: address.city,
                                state: address.state,
                                pincode: address.pincode,
                                country: address.country,
                              });
                            }}>Edit</Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAddress(address._id)}>Delete</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!userProfile.addresses || userProfile.addresses.length === 0) && (
                    <p className="text-center text-muted-foreground col-span-2">No addresses saved yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  My Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item._id} className="border rounded-lg p-4">
                      <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.name} 
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                      <p className="text-lg font-bold text-primary mb-3">₹{item.price}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Add to Cart</Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {wishlistItems.length === 0 && (
                    <p className="text-center text-muted-foreground">No items in your wishlist yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Get delivery updates via SMS</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Privacy Settings</p>
                      <p className="text-sm text-muted-foreground">Manage your data preferences</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Support & Help */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Support & Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full justify-start" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle>Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium mb-1">Your Referral Code</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-lg font-mono">PRIYA2024</code>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share this code with friends and earn ₹100 for each successful referral!
                    </p>
                  </div>
                  <Button>Share Code</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;