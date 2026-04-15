import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { orderAPI } from '@/services/api';
import { checkoutService, paymentAPI, Order } from '@/services/payments';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/services/auth';
import { usePaymentMethods } from '@/hooks/use-payment-methods';
import { ordersAPI, ShiprocketCourierCompany, ShiprocketServiceabilityData } from '@/services/orders';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import {
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Info,
  Leaf,
  Star
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { items, getCartTotal, clearCart } = useCart();

  const { user, loading: userLoading } = useAuth();
  const [userAddresses, setUserAddresses] = useState<Array<{
    _id: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault?: boolean;
  }>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // On mount, pre-fill user info and addresses
  useEffect(() => {
    if (user) {
      setCustomerInfo({
        email: user.email || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || ''
      });
      if (user.addresses && user.addresses.length > 0) {
        setUserAddresses(user.addresses);
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setSelectedAddressId(defaultAddr._id);
        setShippingAddress({
          address1: defaultAddr.line1,
          address2: defaultAddr.line2 || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
          country: defaultAddr.country
        });
      }
    }
  }, [user]);

  // Handler for selecting an address
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const addr = userAddresses.find(a => a._id === addressId);
    if (addr) {
      setShippingAddress({
        address1: addr.line1,
        address2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country
      });
    }
  };

  // Handler for adding a new address
  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    // Validate fields (reuse your validation logic)
    if (!shippingAddress.address1.trim() || !shippingAddress.city.trim() || !shippingAddress.state.trim() || !shippingAddress.pincode.trim() || !shippingAddress.country.trim()) {
      alert('Please fill all required address fields');
      return;
    }
    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      alert('Pincode must be 6 digits');
      return;
    }
    // Save to backend
    const res = await userAPI.addAddress(token, {
      line1: shippingAddress.address1.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pincode.trim(),
      country: shippingAddress.country.trim(),
    });
    if (res.success) {
      setUserAddresses(res.data.addresses);
      setShowNewAddressForm(false);
      // Optionally select the new address
      const newAddr = res.data.addresses[res.data.addresses.length - 1];
      setSelectedAddressId(newAddr._id);
      setShippingAddress({
        address1: newAddr.line1,
        address2: newAddr.line2 || '',
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.pincode,
        country: newAddr.country
      });
    } else {
      alert(res.message || 'Failed to add address');
    }
  };


  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [billingAddress, setBillingAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [orderDetails, setOrderDetails] = useState({
    deliveryOption: 'standard',
    paymentMethod: 'razorpay',
    sameBillingAddress: true,
    specialInstructions: '',
    newsletterSubscribe: false,
    termsAccepted: false
  });

  // Use payment methods hook
  const { paymentMethods, loading: loadingPaymentMethods, getPaymentMethodById } = usePaymentMethods();

  // Mock cart data - in real app this would come from cart context/state
  const cartItems = items.map(item => ({
    id: item.product.id,
    name: item.product.name,
    category: item.product.category,
    price: item.product.price,
    quantity: item.quantity,
    image: item.product.images[0]
  }));

  // Add state for dynamic delivery options
  const [deliveryOptions, setDeliveryOptions] = useState<ShiprocketCourierCompany[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [deliveryOptionsLoading, setDeliveryOptionsLoading] = useState(false);

  // Fetch delivery options when shipping address is set and valid
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) return;
      setDeliveryOptionsLoading(true);
      try {
        const pickupPincode = settings?.pickupPincode ?? '110001';
        const res = await ordersAPI.checkShiprocketServiceability({
          pickup_postcode: pickupPincode,
          delivery_postcode: shippingAddress.pincode,
          weight: 1, // or sum of cart item weights if available
        });
        const courierData = res.data.data as ShiprocketServiceabilityData;
        setDeliveryOptions(courierData.available_courier_companies || []);
        // Auto-select recommended or first courier
        let recommendedId = courierData.recommended_courier_company_id;
        recommendedId = typeof recommendedId === 'number' ? recommendedId : null;
        let firstCourierId = courierData.available_courier_companies?.[0]?.courier_company_id;
        firstCourierId = typeof firstCourierId === 'number' ? firstCourierId : null;
        if (recommendedId !== null) {
          setSelectedCourierId(recommendedId);
        } else if (firstCourierId !== null) {
          setSelectedCourierId(firstCourierId);
        } else {
          setSelectedCourierId(null);
        }
      } catch (e) {
        setDeliveryOptions([]);
        setSelectedCourierId(null);
      }
      setDeliveryOptionsLoading(false);
    };
    fetchDeliveryOptions();
  }, [shippingAddress.pincode]);

  const selectedCourier = deliveryOptions.find(c => c.courier_company_id === selectedCourierId) || null;

  const { settings, loading: settingsLoading } = useAdminSettings();
  useEffect(() => {
    if (settings !== null) {
      console.log('Admin settings:', settings);
    }
  }, [settings]);
  const CHARGE_DELIVERY = settings?.chargeDelivery ?? true;
  const CHARGE_GST = settings?.chargeGST
  const subtotal = getCartTotal();
  const selectedPayment = getPaymentMethodById(orderDetails.paymentMethod);
  const codCharges = selectedPayment?.id === 'cod' ? 49 : 0; // Fixed COD charges
  const tax = CHARGE_GST ? Math.round(subtotal * 0.18) : 0;
  const deliveryCharges = CHARGE_DELIVERY && selectedCourier ? Math.round(Number(selectedCourier.freight_charge)) : 0;
  const total = subtotal + deliveryCharges + codCharges + tax;

  // Validation functions
  const validateStep1 = () => {
    const { email, firstName, lastName, phone } = customerInfo;
    if (!email || !firstName || !lastName || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all customer information fields.",
        variant: "destructive",
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { address1, city, state, pincode } = shippingAddress;
    if (!address1 || !city || !state || !pincode) {
      toast({
        title: "Missing Address",
        description: "Please fill in all required address fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
  // Only check terms acceptance on the final review step
  if (currentStep === 4 && !orderDetails.termsAccepted) {
    toast({
      title: "Terms & Conditions",
      description: "Please accept the terms and conditions to proceed.",
      variant: "destructive",
    });
    return false;
  }
  
  // For step 3 (payment), check if payment method is selected
  if (currentStep === 3) {
    if (!orderDetails.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return false;
    }
    if (!orderDetails.sameBillingAddress && !billingAddress.address1) {
      toast({
        title: "Billing Address Required",
        description: "Please fill in the billing address details.",
        variant: "destructive",
      });
      return false;
    }
  }
  
  return true;
};

 const handleNextStep = () => {
  let isValid = false;

  switch (currentStep) {
    case 1:
      isValid = validateStep1();
      break;
    case 2:
      isValid = validateStep2();
      break;
    case 3:
      isValid = validateStep3();
      break;
    case 4:
      isValid = validateStep3(); // Terms validation only happens here now
      break;
    default:
      isValid = true;
  }

  if (isValid) {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }
};
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle final order submission
  const handlePlaceOrder = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // Prepare order data according to new API schema
      const orderData = {
        // Order items
        orderItems: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })),

        // Shipping address
        shippingAddress: {
          address: shippingAddress.address1,
          city: shippingAddress.city,
          postalCode: shippingAddress.pincode,
          state: shippingAddress.state, 
          country: shippingAddress.country,
          phone: customerInfo.phone
        },

        // Payment method
        paymentMethod: orderDetails.paymentMethod === 'card' ? 'razorpay' : orderDetails.paymentMethod,

        // Order totals
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: deliveryCharges,
        totalPrice: total
      };

      

      // Debug: Check if token is available
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      

      // Process order based on payment method
      let response;
      if (orderDetails.paymentMethod === 'cod') {
        // For COD orders, create order directly
        response = await checkoutService.processCODOrder(orderData);
      } else {
        // For online payments, create order first then process payment
        const order = await checkoutService.createOrder(orderData);
        
        // Process online payment
        const paymentResult = await checkoutService.processOnlinePayment(
          order._id,
          order.totalPrice,
          {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            contact: customerInfo.phone
          }
        );
        
        // Type assertion to fix TS error
        const verified = paymentResult as { status: string; data: { order: Order }; message: string };
        response = verified.data.order;
      }

      

      toast({
        title: "Order Placed Successfully!",
        description: `Order has been created. You will receive a confirmation email shortly.`,
      });

      // Clear cart after successful order
      clearCart();

      // Navigate to success page with order details
      const orderId = response._id || response.orderNumber || response.id || response.data?._id || response.data?.orderNumber || response.data?.id;
      navigate(`/order-success/${orderId}`, {
        state: {
          orderData: response.data || response,
          total: total
        }
      });

    } catch (error: unknown) {
      console.error('Order placement error:', error);

      // Handle specific API errors
      let errorMessage = "Something went wrong. Please try again.";
      
      // Type guard for error with response property
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { message?: string } } };
        
        if (apiError.response?.status === 401) {
          errorMessage = "Please log in to place an order.";
        } else if (apiError.response?.status === 400) {
          errorMessage = apiError.response?.data?.message || "Invalid order data. Please check your information.";
        } else if (apiError.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add empty cart check
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4 mx-auto"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Customer Info', icon: User },
    { number: 2, title: 'Shipping', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Secure Checkout</h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Complete your order and get fresh tea delivered to your doorstep
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto gap-2 md:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 ${currentStep >= step.number
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-muted-foreground/30 text-muted-foreground'
                  }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </div>
                <div className="ml-1 md:ml-2 hidden sm:block">
                  <p className={`text-xs md:text-sm font-medium ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-5 md:w-8 sm:w-16 h-0.5 mx-2 md:mx-4 ${currentStep > step.number ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <User className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="h-10"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {user && userAddresses.length > 0 && !showNewAddressForm && (
                      <div className="mb-4">
                        <Label>Select a saved address:</Label>
                        <div className="space-y-2">
                          {userAddresses.map(addr => (
                            <div key={addr._id} className={`border rounded p-2 flex items-center justify-between ${selectedAddressId === addr._id ? 'border-primary' : ''}`}>
                              <div>
                                <div>{addr.line1}</div>
                                {addr.line2 && <div>{addr.line2}</div>}
                                <div>{addr.city}, {addr.state} {addr.pincode}</div>
                                <div>{addr.country}</div>
                              </div>
                              <Button size="sm" variant={selectedAddressId === addr._id ? 'default' : 'outline'} onClick={() => handleSelectAddress(addr._id)} className="h-8 px-3">
                                {selectedAddressId === addr._id ? 'Selected' : 'Select'}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button size="sm" className="mt-2 h-8 px-3" onClick={() => setShowNewAddressForm(true)}>Add New Address</Button>
                      </div>
                    )}
                    {showNewAddressForm && (
                      <form onSubmit={handleAddNewAddress} className="space-y-2 border rounded-lg p-3 md:p-4 mb-4">
                        <Input placeholder="Address Line 1" value={shippingAddress.address1} onChange={e => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))} required className="h-9" />
                        <Input placeholder="Address Line 2" value={shippingAddress.address2} onChange={e => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))} className="h-9" />
                        <Input placeholder="City" value={shippingAddress.city} onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))} required className="h-9" />
                        <Input placeholder="State" value={shippingAddress.state} onChange={e => setShippingAddress(prev => ({ ...prev, state: e.target.value }))} required className="h-9" />
                        <Input placeholder="Pincode" value={shippingAddress.pincode} onChange={e => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))} required className="h-9" />
                        <Input placeholder="Country" value={shippingAddress.country} onChange={e => setShippingAddress(prev => ({ ...prev, country: e.target.value }))} required className="h-9" />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="h-8 px-3">Save</Button>
                          <Button type="button" size="sm" variant="outline" className="h-8 px-3" onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                        </div>
                      </form>
                    )}
                    <div>
                      <Label htmlFor="address1">Address Line 1 *</Label>
                      <Input
                        id="address1"
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                        placeholder="Street address, P.O. Box, company name"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address2">Address Line 2</Label>
                      <Input
                        id="address2"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        className="h-10"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="City"
                          className="h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Select
                          value={shippingAddress.state}
                          onValueChange={(value) => setShippingAddress(prev => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="Delhi">Delhi</SelectItem>
                            <SelectItem value="Karnataka">Karnataka</SelectItem>
                            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="West Bengal">West Bengal</SelectItem>
                            <SelectItem value="Gujarat">Gujarat</SelectItem>
                            <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="Punjab">Punjab</SelectItem>
                            <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                            <SelectItem value="Assam">Assam</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                          id="pincode"
                          value={shippingAddress.pincode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="400001"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Options */}
                {CHARGE_DELIVERY && (
                  <Card className="shadow-lg border-2 border-primary/20 rounded-xl mb-4">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg md:text-xl gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <span className="font-bold">Delivery Options</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deliveryOptionsLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                          <span className="ml-2 text-base font-medium text-primary">Checking delivery options...</span>
                        </div>
                      ) : deliveryOptions.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center">No delivery options available for this pincode.</div>
                      ) : (
                        <RadioGroup
                          value={selectedCourierId?.toString()}
                          onValueChange={val => setSelectedCourierId(Number(val))}
                          className="space-y-3"
                        >
                          {deliveryOptions.map(option => (
                            <div
                              key={option.courier_company_id}
                              className={`flex flex-col sm:flex-row items-center justify-between gap-2 border rounded-xl p-3 shadow-sm transition-all duration-200 cursor-pointer ${selectedCourierId === option.courier_company_id ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'border-gray-200 bg-white hover:bg-primary/10'}`}
                              onClick={() => setSelectedCourierId(option.courier_company_id)}
                            >
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <RadioGroupItem value={option.courier_company_id.toString()} id={option.courier_company_id.toString()} className="h-5 w-5" />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-base text-foreground">{option.courier_name}</span>
                                  <span className="text-xs text-muted-foreground">ETA: <span className="font-bold text-green-700">{option.estimated_delivery_days} days</span></span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="secondary" className="text-base px-3 py-1 rounded-full bg-primary/10 text-primary font-bold shadow">
                                  ₹{Math.round(Number(option.freight_charge))}
                                </Badge>
                                {option.rating && (
                                  <span className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                    <Star className="h-3 w-3" /> {option.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-4 md:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPaymentMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading payment methods...</span>
                      </div>
                    ) : (
                      <RadioGroup
                        value={orderDetails.paymentMethod}
                        onValueChange={(value) => setOrderDetails(prev => ({ ...prev, paymentMethod: value }))}
                      >
                        {paymentMethods.filter(method => method.isActive).map((method) => (
                          <div key={method.id} className="flex items-center space-x-2 md:space-x-3 border rounded-lg p-3 md:p-4">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="font-medium cursor-pointer text-sm md:text-base">
                                {method.name}
                              </Label>
                              <p className="text-xs md:text-sm text-muted-foreground">{method.description}</p>
                              {method.methods && method.methods.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {method.methods.map((subMethod) => (
                                    <span key={subMethod.id} className="text-xs bg-muted px-2 py-1 rounded">
                                      {subMethod.icon} {subMethod.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameBilling"
                        checked={orderDetails.sameBillingAddress}
                        onCheckedChange={(checked) => setOrderDetails(prev => ({ ...prev, sameBillingAddress: !!checked }))}
                      />
                      <Label htmlFor="sameBilling">Same as shipping address</Label>
                    </div>

                    {!orderDetails.sameBillingAddress && (
                      <div className="space-y-3 md:space-y-4 pt-4 border-t">
                        <div>
                          <Label htmlFor="billAddress1">Address Line 1 *</Label>
                          <Input
                            id="billAddress1"
                            value={billingAddress.address1}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, address1: e.target.value }))}
                            placeholder="Billing address"
                            className="h-10"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
                          <div>
                            <Label htmlFor="billCity">City *</Label>
                            <Input
                              id="billCity"
                              value={billingAddress.city}
                              onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                              placeholder="City"
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billState">State *</Label>
                            <Select
                              value={billingAddress.state}
                              onValueChange={(value) => setBillingAddress(prev => ({ ...prev, state: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                <SelectItem value="Delhi">Delhi</SelectItem>
                                <SelectItem value="Karnataka">Karnataka</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="billPincode">PIN Code *</Label>
                            <Input
                              id="billPincode"
                              value={billingAddress.pincode}
                              onChange={(e) => setBillingAddress(prev => ({ ...prev, pincode: e.target.value }))}
                              placeholder="400001"
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Special Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div>
                      <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        value={orderDetails.specialInstructions}
                        onChange={(e) => setOrderDetails(prev => ({ ...prev, specialInstructions: e.target.value }))}
                        placeholder="Any special delivery instructions or gift message..."
                        rows={3}
                        className="min-h-[80px] md:min-h-[96px]"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={orderDetails.newsletterSubscribe}
                        onCheckedChange={(checked) => setOrderDetails(prev => ({ ...prev, newsletterSubscribe: !!checked }))}
                      />
                      <Label htmlFor="newsletter">Subscribe to our newsletter for tea tips and exclusive offers</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Review Order */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* Customer Info Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                      <p>{customerInfo.email}</p>
                      <p>{customerInfo.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{shippingAddress.address1}</p>
                      {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Payment & Delivery</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Payment: {selectedPayment?.name}</span>
                        {codCharges > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            COD: ₹{codCharges}
                          </Badge>
                        )}
                      </div>
                      <p>Delivery: {selectedCourier ? `${selectedCourier.courier_name} (ETA: ${selectedCourier.estimated_delivery_days} days)` : 'N/A'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={orderDetails.termsAccepted}
                      onCheckedChange={(checked) => setOrderDetails(prev => ({ ...prev, termsAccepted: !!checked }))}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="text-primary hover:underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-muted/50 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Secure Checkout</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 md:mt-8 gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="flex items-center h-9 md:h-10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNextStep} className="flex items-center h-9 md:h-10">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !orderDetails.termsAccepted}
                  className="flex items-center h-9 md:h-10"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-2 md:space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 md:gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs md:text-sm font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between text-xs md:text-base">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-base">
                      <span>Delivery</span>
                      <span>{deliveryCharges > 0 ? `₹${deliveryCharges}` : 'Free'}</span>
                    </div>
                    {selectedCourier?.estimated_delivery_days && (
                      <div className="flex justify-between text-xs md:text-base items-center">
                        <span className="flex items-center gap-1">
                          <Truck className="inline h-4 w-4 text-green-700 mr-1" />
                          Estimated Delivery
                        </span>
                        <span>{selectedCourier.estimated_delivery_days} days</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs md:text-base">
                      <span>GST (18%)</span>
                      <span>{tax > 0 ? `₹${tax}` : 'Free'}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-base md:text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>

                  {/* Trust Badges */}
                  <div className="border-t pt-3 md:pt-4 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>SSL Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Free shipping on ₹999+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="font-medium text-xs md:text-sm">Need Help?</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 md:mb-3">
                    Have questions about your order?
                  </p>
                  <Button variant="outline" size="sm" className="w-full h-8 md:h-9" asChild>
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;