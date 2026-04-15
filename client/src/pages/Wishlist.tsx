import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userAPI } from '@/services/auth';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  X, 
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  Trash2,
  Share2,
  Eye
} from 'lucide-react';

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  category: string;
  type: string[];
  region: string;
  price: number;
  originalPrice?: number;
  offer?: string;
  rating: number;
  reviewCount: number;
  badges: string[];
  images: string[];
  dateAdded: string;
}

const Wishlist = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setWishlistLoading(true);
        const response = await userAPI.getWishlist(token);
        
        if (response.success && Array.isArray(response.data)) {
          setWishlistItems(response.data);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistItems([]);
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  // Sort wishlist items
  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'dateAdded':
      default:
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  const removeFromWishlist = async (itemId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await userAPI.removeFromWishlist(token, itemId);
      if (response.success) {
        setWishlistItems(items => items.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const clearWishlist = async () => {
    // Clear wishlist by removing all items one by one
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const promises = wishlistItems.map(item => userAPI.removeFromWishlist(token, item._id));
      await Promise.all(promises);
      setWishlistItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const addToCart = async (itemId: string) => {
    // Add to cart logic - you can implement this based on your cart API
    
    // For now, just remove from wishlist
    await removeFromWishlist(itemId);
  };

  const moveAllToCart = async () => {
    // Move all items to cart logic
    
    // For now, just clear the wishlist
    await clearWishlist();
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Wishlist</h1>
            <p className="text-xl text-muted-foreground">
              Your favorite teas saved for later
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length > 0 ? (
          <>
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold">
                  {wishlistItems.length} Item{wishlistItems.length !== 1 ? 's' : ''}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWishlist}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dateAdded">Recently Added</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Found the perfect teas? Add them all to your cart at once!
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button onClick={moveAllToCart} className="flex-1 sm:flex-none">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add All to Cart
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share List
                  </Button>
                </div>
              </div>
            </div>

            {/* Wishlist Items */}
            {wishlistLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="bg-gray-200 h-48"></div>
                    <CardContent className="p-4">
                      <div className="bg-gray-200 h-4 mb-2"></div>
                      <div className="bg-gray-200 h-6 mb-2"></div>
                      <div className="bg-gray-200 h-4 w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedItems.map((item) => (
                  <Card key={item._id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.images?.[0] || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {item.badges.slice(0, 1).map((badge, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <Badge variant="destructive" className="text-xs">
                            {getDiscountPercentage(item.originalPrice, item.price)}% OFF
                          </Badge>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                        onClick={() => removeFromWishlist(item._id)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/product/${item.slug}`}>
                            {item.name}
                          </Link>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1">{item.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({item.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.type.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground mb-3">
                        <p>{item.region}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-lg text-muted-foreground line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                      
                      {item.offer && (
                        <p className="text-xs text-green-600 mb-3">{item.offer}</p>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0 space-y-2">
                      <div className="flex gap-2 w-full">
                        <Button 
                          className="flex-1" 
                          onClick={() => addToCart(item._id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/product/${item.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {sortedItems.map((item) => (
                  <Card key={item._id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative sm:w-48 h-48 sm:h-auto">
                        <img
                          src={item.images?.[0] || '/placeholder.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              {item.badges.map((badge, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {badge}
                                </Badge>
                              ))}
                              {item.originalPrice && item.originalPrice > item.price && (
                                <Badge variant="destructive" className="text-xs">
                                  {getDiscountPercentage(item.originalPrice, item.price)}% OFF
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                              <Link to={`/product/${item.slug}`}>
                                {item.name}
                              </Link>
                            </h3>

                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium ml-1">{item.rating}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({item.reviewCount} reviews)
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">{item.region}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.type.map((type, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>

                            {item.offer && (
                              <p className="text-sm text-green-600 mb-3">{item.offer}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-lg text-muted-foreground line-through">₹{item.originalPrice}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => addToCart(item._id)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/product/${item.slug}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromWishlist(item._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="h-24 w-24 mx-auto text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Explore our collection of premium teas and add your favorites to your wishlist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/shop">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Browse Teas
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/search">
                  <Filter className="h-5 w-5 mr-2" />
                  Advanced Search
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

export default Wishlist;