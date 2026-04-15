import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, ShoppingCart, Star, Minus, Plus, Share2, Clock, Thermometer, Coffee, Leaf, Award, Shield, Loader2, Truck } from "lucide-react";
import FAQ from "@/components/FAQ";
import { useProducts } from "@/hooks/use-products";
import { Product } from "@/services/products";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { userAPI } from "@/services/auth";
import { Helmet } from "react-helmet-async";
import { ordersAPI } from "@/services/orders";
import { ShiprocketCourierCompany, ShiprocketServiceabilityData } from "@/services/orders";


const ProductDetails = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [eta, setEta] = useState<string | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);


  const { getProductBySlug } = useProducts();



  useEffect(() => {
    const fetchProduct = async () => {
      if (slug) {
        setLoading(true);
        const fetchedProduct = await getProductBySlug(slug);
        setProduct(fetchedProduct);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]); // Remove getProductBySlug from dependencies to prevent infinite loop

  // Check if product is in wishlist when product loads
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product || !user) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await userAPI.getWishlist(token);
        if (response.success && Array.isArray(response.data)) {
          const isInWishlist = response.data.some((item: { _id: string; slug: string }) => 
            item._id === product.id || item.slug === product.slug
          );
          setIsFavorited(isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [product, user]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setWishlistLoading(true);
      
      if (isFavorited) {
        // Remove from wishlist
        const response = await userAPI.removeFromWishlist(token, product.id || product.slug);
        if (response.success) {
          setIsFavorited(false);
          toast({
            title: "Removed from wishlist",
            description: `${product.name} removed from your wishlist`,
          });
        }
      } else {
        // Add to wishlist
        const response = await userAPI.addToWishlist(token, product.id || product.slug);
        if (response.success) {
          setIsFavorited(true);
          toast({
            title: "Added to wishlist",
            description: `${product.name} added to your wishlist`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchEta = async (deliveryPincode: string) => {
    if (!product) return;
    setEtaLoading(true);
    try {
      const pickup_postcode = "110001"; // Default warehouse pincode
      const weight = 1; // You can use product.weight if available
      const res = await ordersAPI.checkShiprocketServiceability({
        pickup_postcode,
        delivery_postcode: deliveryPincode,
        weight,
      });
      console.log('Shiprocket serviceability response:', res);
      const courierData = res.data.data as ShiprocketServiceabilityData;
      const recommendedId = courierData.recommended_courier_company_id;
      const recommended = courierData.available_courier_companies.find(
        (c: ShiprocketCourierCompany) => c.courier_company_id === recommendedId
      ) || courierData.available_courier_companies[0];
      setEta(
        recommended?.estimated_delivery_days
          ? `${recommended.estimated_delivery_days} days`
          : null
      );
    } catch (e) {
      setEta(null);
    }
    setEtaLoading(false);
  };

  useEffect(() => {
    // Get pincode from user's default address or first address
    const pincode =
      user?.addresses?.find(a => a.isDefault)?.pincode ||
      user?.addresses?.[0]?.pincode ||
      null;
    if (product && pincode) {
      fetchEta(pincode);
    }
  }, [product, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Product not found</h2>
          <Button onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const getBadgeVariant = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'new':
        return 'default';
      case 'bestseller':
        return 'secondary';
      case 'gift':
        return 'destructive';
      case 'organic':
        return 'default';
      case 'wellness':
        return 'secondary';
      case 'limited edition':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleShare = () => {
    const shareData = {
      title: product.name,
      text: `Check out this amazing tea: ${product.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };


  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsProcessing(true);
      addToCart(product, quantity);

      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };



  const handleBuyNow = async () => {
    if (!product || isProcessing) return;

    try {
      setIsProcessing(true);
      addToCart(product, quantity);

      toast({
        title: "Added to cart",
        description: "Proceeding to checkout...",
      });

      navigate('/checkout');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {product 
            ? `${product.name} | Yellow Tea - Premium Indian Tea`
            : "Premium Indian Tea | Yellow Tea"
          }
        </title>
        <meta 
          name="description" 
          content={
            product
              ? (product.subtitle 
                  ? `${product.subtitle.substring(0, 160)}...`
                  : `Discover ${product.name} - Premium Indian tea from ${product.region || 'India'}. Fresh, whole leaf tea delivered from garden to cup.`)
              : "Discover premium Indian teas from Yellow Tea. Fresh, whole leaf tea delivered from garden to cup in 10 days."
          }
        />
        <meta 
          name="keywords" 
          content={`${product?.name || 'Premium Indian Tea'}, Yellow Tea, whole leaf tea, ${product?.category || 'tea'}, ${product?.region || 'Indian tea'}, buy tea online`}
        />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={product ? `${product.name} | Yellow Tea` : "Premium Indian Tea | Yellow Tea"} />
        <meta 
          property="og:description" 
          content={
            product
              ? (product.subtitle 
                  ? `${product.subtitle.substring(0, 160)}...`
                  : `Discover ${product.name} - Premium Indian tea from ${product.region || 'India'}. Fresh, whole leaf tea delivered from garden to cup.`)
              : "Discover premium Indian teas from Yellow Tea. Fresh, whole leaf tea delivered from garden to cup in 10 days."
          }
        />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={window.location.href} />
        {product?.images && product.images.length > 0 && (
          <meta property="og:image" content={product.images[0]} />
        )}
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product ? `${product.name} | Yellow Tea` : "Premium Indian Tea | Yellow Tea"} />
        <meta 
          name="twitter:description" 
          content={
            product
              ? (product.subtitle 
                  ? `${product.subtitle.substring(0, 160)}...`
                  : `Discover ${product.name} - Premium Indian tea from ${product.region || 'India'}. Fresh, whole leaf tea delivered from garden to cup.`)
              : "Discover premium Indian teas from Yellow Tea. Fresh, whole leaf tea delivered from garden to cup in 10 days."
          }
        />
        {product?.images && product.images.length > 0 && (
          <meta name="twitter:image" content={product.images[0]} />
        )}
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Navigation */}
        <div className="border-b bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate("/shop")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Two Column Layout */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Product Images Gallery */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100">
                <img
                  src={product.images?.[activeImageIndex] || '/uploads/placeholder.png'}
                  alt={`${product.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  {product.badges.map((badge, index) => (
                    <Badge
                      key={index}
                      variant={getBadgeVariant(badge)}
                      className="text-sm px-3 py-1 bg-background/90 text-foreground border-border backdrop-blur-sm"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
                {/* Image counter */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-6 right-6">
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                      {activeImageIndex + 1} / {product.images.length}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative rounded-lg overflow-hidden aspect-square bg-gradient-to-br from-amber-50 to-orange-100 transition-all duration-300 ${activeImageIndex === index
                        ? 'ring-2 ring-primary shadow-lg scale-105'
                        : 'hover:scale-105 hover:shadow-md opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-8">
              {/* Product Header */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-2">
                    {product.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {product.subtitle}
                  </p>
                  <p className="text-lg text-muted-foreground font-medium">
                    {product.quantity}
                  </p>
                </div>

                {/* Rating and Stock */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 transition-colors ${i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviews_count || product.reviewCount} reviews)
                    </span>
                  </div>
                  <Badge variant="outline" className="border-border bg-card text-card-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    In Stock
                  </Badge>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-foreground">₹{product.price}</div>
                  {product.offer && (
                    <Badge variant="destructive" className="text-sm font-medium">
                      {product.offer}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quantity & Purchase */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={decreaseQuantity}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-xl min-w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={increaseQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">₹{product.price * quantity}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
                {eta && (
                  <div className="mb-4 text-green-700 font-medium flex items-center gap-2">
                    <Truck className="inline h-5 w-5 mr-1 text-green-700" />
                    Estimated Delivery: {eta}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="w-1/2 h-14 bg-white text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center"
                    disabled={isProcessing}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    className="w-1/2 h-14 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center"
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>



                <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Vacuum Sealed
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Fresh Guarantee
                  </span>
                </div>
              </Card>

              {/* Flavor Profile */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Coffee className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Flavor Profile</h3>
                  </div>
                  <div className="flex justify-center gap-12">
                    {(product.taste_notes || []).map((note, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full mb-3 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                          <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-foreground text-center">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Desktop Bottom Sections */}
          <div className="mt-12 grid lg:grid-cols-2 gap-8">
            {/* Garden Story */}
            <Card className="overflow-hidden animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-foreground">Garden Story</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-foreground">{product.origin?.garden_name || product.region}</h4>
                    <p className="text-muted-foreground">{product.region}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {product.flush} Flush
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {product.packaging}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {product.origin?.harvest_date || 'Recent'}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {product.type.join(', ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-green-800">Premium Quality</div>
                          <div className="text-sm text-green-600">100% Natural & Organic</div>
                        </div>
                      </div>
                    </div>
                    <div className="group p-4 bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded">
                          <Heart className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-800">Direct Trade</div>
                          <div className="text-sm text-blue-600">Fair to Farmers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brewing Guide */}
            <Card className="overflow-hidden animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-foreground">Perfect Brew Guide</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-lg border border-orange-200">
                    <Thermometer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Temperature</div>
                    <div className="font-semibold text-foreground">{product.brewing?.temperature_c ? `${product.brewing.temperature_c}°C` : '85°C'}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Steeping Time</div>
                    <div className="font-semibold text-foreground">{product.brewing?.time_min ? `${product.brewing.time_min} min` : '3 min'}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                    <Coffee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="font-semibold text-foreground">1 tsp/cup</div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2">Pro Brewing Tip</h4>
                  <p className="text-sm text-amber-700 mb-4">
                    Scan QR for brewing videos & timer
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center border border-amber-200">
                      <div className="text-xs font-mono text-center">
                        <div className="text-amber-800">◼ ◼ ◼</div>
                        <div className="text-amber-600 text-xs">QR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/shop")}
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Product Images */}
        <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
          <img
            src={product.images?.[activeImageIndex] || '/uploads/placeholder.png'}
            alt={`${product.name} - Image ${activeImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 animate-slide-up">
            {product.badges.map((badge, index) => (
              <Badge
                key={index}
                variant={getBadgeVariant(badge)}
                className="text-xs px-2 py-1 bg-background/90 text-foreground border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {badge}
              </Badge>
            ))}
          </div>

          {/* Image counter for mobile */}
          {product.images && product.images.length > 1 && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs">
                {activeImageIndex + 1} / {product.images.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Mobile Thumbnail Gallery */}
        {product.images && product.images.length > 1 && (
          <div className="px-6 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-100 transition-all duration-300 ${activeImageIndex === index
                    ? 'ring-2 ring-primary shadow-lg scale-105'
                    : 'opacity-70'
                    }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="container-mobile">
          {/* Mobile Product Header */}
          <div className="py-4 space-y-4 animate-slide-up">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {product.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {product.quantity}
                  </p>
                </div>
              </div>

              {/* Rating and Stock */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 transition-colors ${i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <Badge variant="outline" className="text-xs border-border bg-card text-card-foreground">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                  In Stock
                </Badge>
              </div>

              {/* Price with Enhanced Display */}
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">₹{product.price}</div>
                {product.offer && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    {product.offer}
                  </Badge>
                )}
              </div>
              {eta && (
                <div className="mb-2 text-green-700 font-medium flex items-center gap-2">
                  <Truck className="inline h-5 w-5 mr-1 text-green-700" />
                  Estimated Delivery: {eta}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Flavor Profile */}
          <Card className="mb-4 overflow-hidden animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Flavor Profile</h3>
              </div>
              <div className="flex justify-center gap-8 md:gap-12">
                {(product.taste_notes || []).map((note, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full mb-2 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                      <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">{note}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Garden Story */}
          <Card className="mb-4 overflow-hidden animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-4 w-4 text-green-600" />
                <h3 className="text-lg font-semibold text-foreground">Garden Story</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground">{product.origin?.garden_name || product.region}</h4>
                  <p className="text-xs text-muted-foreground">{product.region}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    {product.flush} Flush
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {product.packaging}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {product.origin?.harvest_date || 'Recent'}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {product.type.join(', ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="group p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-500 rounded">
                        <Award className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-green-800">Premium Quality</div>
                        <div className="text-xs text-green-600">100% Natural</div>
                      </div>
                    </div>
                  </div>
                  <div className="group p-3 bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500 rounded">
                        <Heart className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-blue-800">Direct Trade</div>
                        <div className="text-xs text-blue-600">Fair to Farmers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Brewing Guide */}
          <Card className="mb-4 overflow-hidden animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer className="h-4 w-4 text-orange-600" />
                <h3 className="text-lg font-semibold text-foreground">Perfect Brew Guide</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-100 rounded-lg border border-orange-200">
                  <Thermometer className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Temperature</div>
                  <div className="text-xs font-semibold text-foreground">{product.brewing?.temperature_c ? `${product.brewing.temperature_c}°C` : '85°C'}</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Steeping Time</div>
                  <div className="text-xs font-semibold text-foreground">{product.brewing?.time_min ? `${product.brewing.time_min} min` : '3 min'}</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                  <Coffee className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-xs text-muted-foreground">Quantity</div>
                  <div className="text-xs font-semibold text-foreground">1 tsp/cup</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-lg border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-800 mb-1">🎯 Pro Brewing Tip</h4>
                <p className="text-xs text-amber-700 mb-3">
                  Scan QR for brewing videos & timer
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center border border-amber-200">
                    <div className="text-xs font-mono text-center">
                      <div className="text-amber-800">◼ ◼ ◼</div>
                      <div className="text-amber-600 text-xs">QR</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spacer for fixed bottom bar */}
          <div className="h-24"></div>
        </div>

        {/* Mobile Bottom Purchase Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-40 shadow-lg">
          <div className="container-mobile">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Quantity</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg min-w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={increaseQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">₹{product.price * quantity}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-base"
              onClick={handleBuyNow}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now
                </>
              )}
            </Button>


            <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Vacuum Sealed
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Fresh Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 py-12">
        <FAQ />
      </div>

      <Footer />
    </div>
    </>
  );
};

export default ProductDetails;