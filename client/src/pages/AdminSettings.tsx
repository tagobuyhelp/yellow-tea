import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Store, 
  Mail, 
  Shield, 
  CreditCard, 
  Truck, 
  Bell,
  Save,
  Upload,
  Database
} from "lucide-react";

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Yellow Tea",
    storeDescription: "Premium Indian Tea Collection",
    storeEmail: "info@yellowtea.in",
    storePhone: "+91 98765 43210",
    storeAddress: "123 Tea Garden, Assam, India",
    currency: "INR",
    timezone: "Asia/Kolkata",
    storeLogo: "",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    lowStockAlerts: true,
    customerRegistration: true,
    weeklyReports: true,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    codEnabled: true,
    minOrderAmount: 500,
    maxOrderAmount: 50000,
  });

  // Shipping Settings
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 999,
    standardShipping: 50,
    expressShipping: 150,
    internationalShipping: 500,
    shippingTax: 18,
    pickupPincode: '741165',
  });

  const handleSaveSettings = async (section: string) => {
    try {
      setLoading(true);
      
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      toast({
        title: "Settings Saved",
        description: `${section} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your store settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>Store</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Shipping</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Store Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Store Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({...storeSettings, storeEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({...storeSettings, storePhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={storeSettings.currency}
                    onValueChange={(value) => setStoreSettings({...storeSettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings({...storeSettings, storeDescription: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({...storeSettings, storeAddress: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings("Store")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Razorpay Integration</h4>
                    <p className="text-sm text-gray-500">Enable online payments via Razorpay</p>
                  </div>
                  <Switch
                    checked={paymentSettings.razorpayEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, razorpayEnabled: checked})}
                  />
                </div>
                
                {paymentSettings.razorpayEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                      <Input
                        id="razorpayKeyId"
                        value={paymentSettings.razorpayKeyId}
                        onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeyId: e.target.value})}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                      <Input
                        id="razorpayKeySecret"
                        type="password"
                        value={paymentSettings.razorpayKeySecret}
                        onChange={(e) => setPaymentSettings({...paymentSettings, razorpayKeySecret: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cash on Delivery</h4>
                  <p className="text-sm text-gray-500">Allow customers to pay on delivery</p>
                </div>
                <Switch
                  checked={paymentSettings.codEnabled}
                  onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, codEnabled: checked})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrder">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    value={paymentSettings.minOrderAmount}
                    onChange={(e) => setPaymentSettings({...paymentSettings, minOrderAmount: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrder">Maximum Order Amount (₹)</Label>
                  <Input
                    id="maxOrder"
                    type="number"
                    value={paymentSettings.maxOrderAmount}
                    onChange={(e) => setPaymentSettings({...paymentSettings, maxOrderAmount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings("Payment")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Shipping Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShipping">Free Shipping Threshold (₹)</Label>
                  <Input
                    id="freeShipping"
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="standardShipping">Standard Shipping (₹)</Label>
                  <Input
                    id="standardShipping"
                    type="number"
                    value={shippingSettings.standardShipping}
                    onChange={(e) => setShippingSettings({...shippingSettings, standardShipping: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="expressShipping">Express Shipping (₹)</Label>
                  <Input
                    id="expressShipping"
                    type="number"
                    value={shippingSettings.expressShipping}
                    onChange={(e) => setShippingSettings({...shippingSettings, expressShipping: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="internationalShipping">International Shipping (₹)</Label>
                  <Input
                    id="internationalShipping"
                    type="number"
                    value={shippingSettings.internationalShipping}
                    onChange={(e) => setShippingSettings({...shippingSettings, internationalShipping: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="pickupPincode">Pickup Pincode</Label>
                  <Input
                    id="pickupPincode"
                    type="text"
                    value={shippingSettings.pickupPincode}
                    onChange={(e) => setShippingSettings({...shippingSettings, pickupPincode: e.target.value})}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="Enter warehouse pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings("Shipping")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'smsNotifications' && 'Receive notifications via SMS'}
                      {key === 'orderNotifications' && 'Get notified about new orders'}
                      {key === 'lowStockAlerts' && 'Alert when products are low in stock'}
                      {key === 'customerRegistration' && 'Notify when new customers register'}
                      {key === 'weeklyReports' && 'Receive weekly sales reports'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setNotifications({...notifications, [key]: checked})}
                  />
                </div>
              ))}

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings("Notification")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Change Password</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Data Management</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings("Security")}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
