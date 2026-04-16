import { useState, useEffect } from 'react';
import { productsService, Product } from '@/services/products';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  Gift,
  Truck,
  Shield,
  Tag,
  ArrowRight,
  Info,
  Clock,
  Leaf,
  Star
} from 'lucide-react';
import { ordersAPI, ShiprocketCourierCompany, ShiprocketServiceabilityData } from '@/services/orders';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSettings } from '@/hooks/use-admin-settings';

const Cart = () => {
  const navigate = useNavigate();
  const { items, addToCart, removeFromCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<ShiprocketCourierCompany[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<ShiprocketCourierCompany | null>(null);
  const [deliveryOptionsLoading, setDeliveryOptionsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { settings, loading: settingsLoading } = useAdminSettings();
  const CHARGE_DELIVERY = settings?.chargeDelivery ?? true;
  const CHARGE_GST = settings?.chargeGST ?? true;
  const pickupPincode = settings?.pickupPincode ?? '110001';


  // Get customer pincode
  const pincode =
    user?.addresses?.find(a => a.isDefault)?.pincode ||
    user?.addresses?.[0]?.pincode ||
    null;

  // Calculate totals
  const subtotal = getCartTotal();
  const savings = Math.round(items.reduce((sum, item) =>
    sum + ((item.product.price * 1.2 - item.product.price) * item.quantity), 0)
  );
  // Remove static deliveryOptions, deliveryOption, and related selection logic
  // Feature flags
  const deliveryCharges = CHARGE_DELIVERY && selectedCourier ? Math.round(Number(selectedCourier.freight_charge)) : 0;
  const promoDiscount = appliedPromo ? Math.min(subtotal * 0.1, 200) : 0;
  const total = subtotal + deliveryCharges - promoDiscount;

  // Update cart actions to use CartContext
  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = items.find(item => item.product.id === productId);
    if (!item) return;

    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      // Remove and re-add with new quantity
      removeFromCart(productId);
      addToCart(item.product, newQuantity);
    }
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    });
  };


  const moveToWishlist = (productId: string) => {
    // Implement wishlist functionality
    toast({
      title: "Added to wishlist",
      description: "The item has been moved to your wishlist",
    });
    removeFromCart(productId);
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'TEA10') {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoCode('');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    // Navigate to checkout with cart data
    navigate('/checkout', {
      state: {
        items,
        subtotal,
        deliveryOption: selectedCourier?.courier_company_id, // Pass selectedCourier ID
        deliveryCharges,
        promoDiscount,
        total
      }
    });
  };

  // Add function to fetch related products
  const fetchRelatedProducts = async () => {
    if (items.length === 0) return;

    try {
      // Get related products based on first item in cart
      const firstItemId = items[0].product.id;
      if (!firstItemId) return;

      const products = await productsService.getRelatedProducts(firstItemId, 3);
      setRelatedProducts(products);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  // Add useEffect to fetch related products when cart items change
  useEffect(() => {
    fetchRelatedProducts();
  }, [items]);

  // Fetch delivery options when pincode or cart changes
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      if (!pincode || items.length === 0) return;
      setDeliveryOptionsLoading(true);
      try {
        const res = await ordersAPI.checkShiprocketServiceability({
          pickup_postcode: pickupPincode,
          delivery_postcode: pincode,
          weight: 1, // or sum of item weights if available
        });
        const courierData = res.data.data as ShiprocketServiceabilityData;
        setDeliveryOptions(courierData.available_courier_companies || []);
        // Pick recommended or first courier
        const recommendedId = typeof courierData.recommended_courier_company_id === 'number' ? courierData.recommended_courier_company_id : null;
        const firstCourier = courierData.available_courier_companies?.[0] || null;
        const recommended = courierData.available_courier_companies.find(
          (c: ShiprocketCourierCompany) => c.courier_company_id === recommendedId
        ) || firstCourier;
        setSelectedCourier(recommended || null);
      } catch (e) {
        setDeliveryOptions([]);
        setSelectedCourier(null);
      }
      setDeliveryOptionsLoading(false);
    };
    fetchDeliveryOptions();
  }, [pincode, items]);

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

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Shopping Cart</h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Review your selected teas and proceed to checkout
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg md:text-xl">
                    <span className="flex items-center">
                      <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Cart Items ({items.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {items.map((item, index) => (
                    <div key={item.product.id}>
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        {/* Product Image */}
                        <div className="sm:w-20 md:w-24 h-20 md:h-24 flex-shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 md:gap-3">
                            <div className="flex-1">
                              <Badge variant="outline" className="text-xs mb-1">
                                {item.product.category}
                              </Badge>
                              <h3 className="font-semibold text-base md:text-lg line-clamp-2 hover:text-primary transition-colors">
                                <Link to={`/product/${item.product.slug}`}>
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="text-xs md:text-sm text-muted-foreground">{item.product.region}</p>

                              <div className="flex flex-wrap gap-1 mt-1 md:mt-2">
                                {item.product.type.map((type, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>

                              {item.product.offer && (
                                <p className="text-xs text-green-600 mt-1 md:mt-2">{item.product.offer}</p>
                              )}
                            </div>

                            {/* Price and Actions */}
                            <div className="flex flex-col items-end gap-2 md:gap-3">
                              <div className="text-right">
                                <div className="text-lg md:text-xl font-bold text-primary">
                                  ₹{item.product.price}
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-lg h-8 md:h-9">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id!, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 md:h-9 md:w-9 p-0"
                                >
                                  <Minus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <span className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium min-w-[2.5rem] md:min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.product.id!, item.quantity + 1)}
                                  className="h-8 w-8 md:h-9 md:w-9 p-0"
                                >
                                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>

                              {/* Item Actions */}
                              <div className="flex gap-1 md:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveToWishlist(item.product.id!)}
                                  className="h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                  <Heart className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(item.product.id!)}
                                  className="text-red-600 hover:text-red-700 h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="flex justify-between items-center mt-2 md:mt-3 pt-2 md:pt-3 border-t">
                            <span className="text-xs md:text-sm text-muted-foreground">Item Total:</span>
                            <span className="font-semibold text-sm md:text-base">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      {index < items.length - 1 && <Separator className="mt-3 md:mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Delivery Options */}
              {CHARGE_DELIVERY && (deliveryOptionsLoading ? (
                <Card className="mb-4">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <span className="ml-2 text-base font-medium text-primary">Checking delivery options...</span>
                  </CardContent>
                </Card>
              ) : selectedCourier ? (
                <Card className="mb-4 shadow-lg border-2 border-primary/20 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="font-bold">Delivery Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-foreground">{selectedCourier.courier_name}</span>
                      <Badge variant="secondary" className="text-base px-3 py-1 rounded-full bg-primary/10 text-primary font-bold shadow">
                        ₹{deliveryCharges}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Truck className="inline h-4 w-4 mr-1" />
                      Estimated Delivery: {selectedCourier.estimated_delivery_days} days
                    </div>
                    {selectedCourier.rating && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <Star className="h-3 w-3" /> {selectedCourier.rating}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ) : null)}

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <Tag className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                      <div className="flex items-center gap-1 md:gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 text-sm md:text-base">
                          {appliedPromo} Applied
                        </span>
                        <span className="text-xs md:text-sm text-green-600">
                          (-₹{promoDiscount})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-green-700 hover:text-green-800 h-7 md:h-8 px-2 md:px-3"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 h-9 md:h-10"
                      />
                      <Button onClick={applyPromoCode} disabled={!promoCode} className="h-9 md:h-10">
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 md:mt-2">
                    Try: TEA10 for 10% off (up to ₹200)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 mt-6 lg:mt-0">
              <div className="sticky top-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Subtotal ({items.length} items)</span>
                      <span>₹{subtotal}</span>
                    </div>

                    {savings > 0 && (
                      <div className="flex justify-between text-green-600 text-sm md:text-base">
                        <span>You Save</span>
                        <span>-₹{savings}</span>
                      </div>
                    )}

                    {CHARGE_DELIVERY && (
                      <div className="flex justify-between text-sm md:text-base">
                        <span>Delivery Charges</span>
                        <span>{deliveryCharges > 0 ? `₹${deliveryCharges}` : 'Free'}</span>
                      </div>
                    )}
                    {CHARGE_DELIVERY && selectedCourier?.estimated_delivery_days && (
                      <div className="flex justify-between text-xs md:text-base items-center">
                        <span className="flex items-center gap-1">
                          <Truck className="inline h-4 w-4 text-green-700 mr-1" />
                          Estimated Delivery
                        </span>
                        <span>{selectedCourier.estimated_delivery_days} days</span>
                      </div>
                    )}

                    {appliedPromo && (
                      <div className="flex justify-between text-green-600 text-sm md:text-base">
                        <span>Promo Discount ({appliedPromo})</span>
                        <span>-₹{promoDiscount}</span>
                      </div>
                    )}

                    {CHARGE_GST && (
                      <div className="flex justify-between text-xs md:text-base">
                        <span>GST (18%)</span>
                        <span>₹{Math.round(subtotal * 0.18)}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-base md:text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>

                    <div className="space-y-2 md:space-y-3 pt-3 md:pt-4">
                      <Button
                        className="w-full h-10 md:h-11"
                        size="lg"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>

                      <Button variant="outline" className="w-full h-10 md:h-11" asChild>
                        <Link to="/shop">
                          Continue Shopping
                        </Link>
                      </Button>
                    </div>

                    {/* Trust Badges */}
                    <div className="border-t pt-3 md:pt-4 space-y-2 md:space-y-3">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Secure SSL encrypted checkout</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span>Free shipping on orders above ₹999</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Gift className="h-4 w-4 text-purple-600" />
                        <span>Free gift wrapping available</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recently Viewed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg">You might also like</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 md:space-y-3">
                      {relatedProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-2 md:gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <Link
                              to={`/product/${product.slug}`}
                              className="text-xs md:text-sm font-medium hover:text-primary transition-colors"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">₹{product.price}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product, 1)}
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                          >
                            <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ))}

                      {relatedProducts.length === 0 && (
                        <p className="text-xs md:text-sm text-muted-foreground text-center py-2">
                          No related products found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-12 md:py-16">
            <div className="mb-4 md:mb-6">
              <ShoppingCart className="h-16 w-16 md:h-24 md:w-24 mx-auto text-muted-foreground/50" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
              Discover our premium tea collection and add your favorites to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button asChild size="lg" className="h-10 md:h-11">
                <Link to="/shop">
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Browse Teas
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-10 md:h-11" asChild>
                <Link to="/wishlist">
                  <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  View Wishlist
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
