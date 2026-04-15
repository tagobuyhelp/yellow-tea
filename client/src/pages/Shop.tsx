import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Star, Loader2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useProducts } from "@/hooks/use-products";
import { Product, ProductQueryParams } from "@/services/products";
import { Helmet } from "react-helmet-async";
// Remove local data imports as we'll use API data

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter & UI states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFlushes, setSelectedFlushes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Featured");

  // Infinite scroll & API
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const PRODUCTS_PER_PAGE = 8;

  // Products hook
  const { products, loading, totalPages, fetchProducts, categories } = useProducts();

  // Initialize filters from URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const flush = searchParams.get('flush');
    const region = searchParams.get('region');
    const packaging = searchParams.get('packaging');
    const featured = searchParams.get('featured');

    // Convert URL parameter values to match product data
    const convertUrlToProductValue = (urlValue: string, filterType: string): string => {
      const mappings: { [key: string]: { [key: string]: string } } = {
        category: {
          'trial-packs': 'Trial Pack',
          'full-sized': 'Full-Sized',
          'gift-boxes': 'Gift Box'
        },
        type: {
          'black': 'Black',
          'green': 'Green',
          'white': 'White',
          'oolong': 'Oolong',
          'herbals': 'Herbal',
          'breakfast': 'Breakfast',
          'masala': 'Masala',
          'matcha': 'Matcha'
        },
        flush: {
          'first': 'Spring',
          'second': 'Summer',
          'third': 'Autumn',
          'fourth': 'Winter'
        },
        region: {
          'darjeeling': 'Darjeeling',
          'assam': 'Assam',
          'sikkim': 'Sikkim',
          'nilgiri': 'Nilgiri'
        },
        packaging: {
          'whole-leaf': 'Whole Leaf',
          'teabags': 'Teabags'
        }
      };

      return mappings[filterType]?.[urlValue] || urlValue;
    };

    if (category) setSelectedCategories([convertUrlToProductValue(category, 'category')]);
    if (type) setSelectedTypes([convertUrlToProductValue(type, 'type')]);
    if (flush) setSelectedFlushes([convertUrlToProductValue(flush, 'flush')]);
    if (region) setSelectedRegions([convertUrlToProductValue(region, 'region')]);
    if (packaging) setSelectedPackaging([convertUrlToProductValue(packaging, 'packaging')]);
    
    // Handle featured filter
    if (featured === 'best-seller') {
      setSortBy('Rating');
    }
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = useCallback((filters: {
    categories?: string[],
    types?: string[],
    flushes?: string[],
    regions?: string[],
    packaging?: string[]
  }) => {
    const newParams = new URLSearchParams();
    
    if (filters.categories && filters.categories.length > 0) {
      newParams.set('category', filters.categories[0]);
    }
    if (filters.types && filters.types.length > 0) {
      newParams.set('type', filters.types[0]);
    }
    if (filters.flushes && filters.flushes.length > 0) {
      newParams.set('flush', filters.flushes[0]);
    }
    if (filters.regions && filters.regions.length > 0) {
      newParams.set('region', filters.regions[0]);
    }
    if (filters.packaging && filters.packaging.length > 0) {
      newParams.set('packaging', filters.packaging[0]);
    }

    setSearchParams(newParams);
  }, [setSearchParams]);

  // Load more products
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    const params = {
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      sort: getSortValue(sortBy)
    };
    await fetchProducts(params);

    // update states after hook state updates
    if (currentPage >= totalPages) {
      setHasMore(false);
    } else {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, sortBy, fetchProducts, totalPages, loading, hasMore]);

  // Reset products when sort changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts({ page: 1, limit: PRODUCTS_PER_PAGE, sort: getSortValue(sortBy) });
  }, [sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMoreProducts();
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreProducts, hasMore, loading]);

  // Get unique values from API products
  const getUniqueCategories = () => Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const getUniqueTypes = () => Array.from(new Set(products.flatMap(p => p.type || []).filter(Boolean)));
  const getUniqueFlushes = () => Array.from(new Set(products.map(p => p.flush).filter(Boolean)));
  const getUniqueRegions = () => Array.from(new Set(products.map(p => p.region).filter(Boolean)));
  const getUniquePackaging = () => Array.from(new Set(products.map(p => p.packaging).filter(Boolean)));

  // Filter products client-side
  const displayedProducts = products.filter(product => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const typeMatch = selectedTypes.length === 0 || product.type.some(t => selectedTypes.includes(t));
    const flushMatch = selectedFlushes.length === 0 || selectedFlushes.includes(product.flush);
    const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(product.region);
    const packagingMatch = selectedPackaging.length === 0 || selectedPackaging.includes(product.packaging);
    return categoryMatch && typeMatch && flushMatch && regionMatch && packagingMatch;
  })
  .filter(product => product.name !== 'MT'); // Filter out fallback/MT product

  // Helper functions
  const toggleFilter = (value: string, currentFilters: string[], setFilters: (filters: string[]) => void, filterType: 'categories' | 'types' | 'flushes' | 'regions' | 'packaging') => {
    let newFilters: string[];
    if (currentFilters.includes(value)) {
      newFilters = currentFilters.filter(f => f !== value);
    } else {
      newFilters = [...currentFilters, value];
    }
    setFilters(newFilters);
    
    // Update URL
    updateURL({
      [filterType]: newFilters
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedFlushes([]);
    setSelectedRegions([]);
    setSelectedPackaging([]);
    setSearchParams({});
  };

  // Convert URL parameter values to display text
  const getDisplayText = (value: string, filterType: string): string => {
    const mappings: { [key: string]: { [key: string]: string } } = {
      category: {
        'Trial Pack': 'Trial Packs',
        'Full-Sized': 'Full-sized',
        'Gift Box': 'Gift Boxes',
        'trial-packs': 'Trial Packs',
        'full-sized': 'Full-sized',
        'gift-boxes': 'Gift Boxes'
      },
      type: {
        'Black': 'Black',
        'Green': 'Green',
        'White': 'White',
        'Oolong': 'Oolong',
        'Herbal': 'Herbals/Tisanes',
        'Breakfast': 'Breakfast',
        'Masala': 'Masala Tea',
        'Matcha': 'Matcha',
        'black': 'Black',
        'green': 'Green',
        'white': 'White',
        'oolong': 'Oolong',
        'herbals': 'Herbals/Tisanes',
        'breakfast': 'Breakfast',
        'masala': 'Masala Tea',
        'matcha': 'Matcha'
      },
      flush: {
        'Spring': 'First/Spring',
        'Summer': 'Second/Summer',
        'Autumn': 'Third/Autumn',
        'Winter': 'Fourth/Winter',
        'first': 'First/Spring',
        'second': 'Second/Summer',
        'third': 'Third/Autumn',
        'fourth': 'Fourth/Winter'
      },
      region: {
        'Darjeeling': 'Darjeeling',
        'Assam': 'Assam',
        'Sikkim': 'Sikkim',
        'Nilgiri': 'Nilgiri',
        'darjeeling': 'Darjeeling',
        'assam': 'Assam',
        'sikkim': 'Sikkim',
        'nilgiri': 'Nilgiri'
      },
      packaging: {
        'Whole Leaf': 'Whole leaf',
        'Teabags': 'Teabags',
        'whole-leaf': 'Whole leaf',
        'teabags': 'Teabags'
      }
    };

    return mappings[filterType]?.[value] || value;
  };

  const getSortValue = (sort: string): string | undefined => {
    switch (sort) {
      case 'Price Low to High': return 'price';
      case 'Price High to Low': return '-price';
      case 'Newest': return '-created_at';
      case 'Rating': return '-rating';
      default: return undefined;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'new':
        return 'bg-green-500';
      case 'bestseller':
        return 'bg-orange-500';
      case 'gift':
        return 'bg-red-500';
      case 'organic':
        return 'bg-green-600';
      case 'wellness':
        return 'bg-blue-500';
      case 'limited edition':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };
  const FilterSidebar = ({
    isMobile = false
  }) => <div className={`${isMobile ? 'p-6' : ''}`}>
      <Accordion type="multiple" defaultValue={["category", "type", "region"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-left">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {getUniqueCategories().map((category, index) => <div key={`category-${category}-${index}`} className="flex items-center space-x-2">
                  <Checkbox id={`category-${category}-${index}`} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleFilter(category, selectedCategories, setSelectedCategories, 'categories')} />
                  <label htmlFor={`category-${category}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {category}
                  </label>
                </div>)}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type">
          <AccordionTrigger className="text-left">Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {getUniqueTypes().map((type, index) => <div key={`type-${type}-${index}`} className="flex items-center space-x-2">
                  <Checkbox id={`type-${type}-${index}`} checked={selectedTypes.includes(type)} onCheckedChange={() => toggleFilter(type, selectedTypes, setSelectedTypes, 'types')} />
                  <label htmlFor={`type-${type}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {type}
                  </label>
                </div>)}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="flush">
          <AccordionTrigger className="text-left">Flush</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {getUniqueFlushes().map((flush, index) => <div key={`flush-${flush}-${index}`} className="flex items-center space-x-2">
                  <Checkbox id={`flush-${flush}-${index}`} checked={selectedFlushes.includes(flush)} onCheckedChange={() => toggleFilter(flush, selectedFlushes, setSelectedFlushes, 'flushes')} />
                  <label htmlFor={`flush-${flush}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {flush}
                  </label>
                </div>)}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="region">
          <AccordionTrigger className="text-left">Region</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {getUniqueRegions().map((region, index) => <div key={`region-${region}-${index}`} className="flex items-center space-x-2">
                  <Checkbox id={`region-${region}-${index}`} checked={selectedRegions.includes(region)} onCheckedChange={() => toggleFilter(region, selectedRegions, setSelectedRegions, 'regions')} />
                  <label htmlFor={`region-${region}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {region}
                  </label>
                </div>)}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="packaging">
          <AccordionTrigger className="text-left">Packaging</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {getUniquePackaging().map((packaging, index) => <div key={`packaging-${packaging}-${index}`} className="flex items-center space-x-2">
                  <Checkbox id={`packaging-${packaging}-${index}`} checked={selectedPackaging.includes(packaging)} onCheckedChange={() => toggleFilter(packaging, selectedPackaging, setSelectedPackaging, 'packaging')} />
                  <label htmlFor={`packaging-${packaging}-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {packaging}
                  </label>
                </div>)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {isMobile && <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6">
          Apply Filters
        </Button>}
    </div>;
  return (
    <>
      <Helmet>
        <title>Shop Premium Indian Teas | Yellow Tea - Whole Leaf Tea Collection</title>
        <meta 
          name="description" 
          content="Discover our premium collection of whole leaf teas from India's finest gardens. Shop Assam, Darjeeling, Green, and specialty teas. Fresh, authentic, and ethically sourced."
        />
        <meta 
          name="keywords" 
          content="buy tea online, Indian tea, whole leaf tea, Assam tea, Darjeeling tea, green tea, premium tea, organic tea, tea shop"
        />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Shop Premium Indian Teas | Yellow Tea" />
        <meta property="og:description" content="Discover our premium collection of whole leaf teas from India's finest gardens. Shop Assam, Darjeeling, Green, and specialty teas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Premium Indian Teas | Yellow Tea" />
        <meta name="twitter:description" content="Discover our premium collection of whole leaf teas from India's finest gardens." />
        
        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-background pb-20">{/* pb-20 for bottom nav space */}
        <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters - Sticky */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4 bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                {(selectedCategories.length > 0 || selectedTypes.length > 0 || selectedFlushes.length > 0 || selectedRegions.length > 0 || selectedPackaging.length > 0) && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs">
                    Clear All
                  </Button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar - Mobile Filter Button and Sorting */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden flex-shrink-0">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar isMobile={true} />
                  </SheetContent>
                </Sheet>
                
                <div className="hidden lg:block">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Premium Tea Collection</h1>
                  <p className="text-sm text-muted-foreground">Discover our handpicked selection from India's finest gardens</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Featured">Sort by: Featured</SelectItem>
                    <SelectItem value="Price Low to High">Price: Low to High</SelectItem>
                    <SelectItem value="Price High to Low">Price: High to Low</SelectItem>
                    <SelectItem value="Newest">Newest</SelectItem>
                    <SelectItem value="Rating">Best Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <h1 className="text-xl font-bold text-foreground">Premium Tea Collection</h1>
              <p className="text-sm text-muted-foreground">Discover our handpicked selection from India's finest gardens</p>
            </div>

            {/* Active Filters Display */}
            {(selectedCategories.length > 0 || selectedTypes.length > 0 || selectedFlushes.length > 0 || selectedRegions.length > 0 || selectedPackaging.length > 0) && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-800">Active Filters:</span>
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs h-6">
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge key={category} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Category: {getDisplayText(category, 'category')}
                    </Badge>
                  ))}
                  {selectedTypes.map(type => (
                    <Badge key={type} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Type: {getDisplayText(type, 'type')}
                    </Badge>
                  ))}
                  {selectedFlushes.map(flush => (
                    <Badge key={flush} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Flush: {getDisplayText(flush, 'flush')}
                    </Badge>
                  ))}
                  {selectedRegions.map(region => (
                    <Badge key={region} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Region: {getDisplayText(region, 'region')}
                    </Badge>
                  ))}
                  {selectedPackaging.map(packaging => (
                    <Badge key={packaging} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Packaging: {getDisplayText(packaging, 'packaging')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid - 2 per line on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {displayedProducts.map((product, productIndex) => <Card key={product.id || `product-${productIndex}`} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card border">
                  <CardContent className="p-3 sm:p-4">
                    <div className="relative mb-3">
                      <img src={product.images?.[0] || '/uploads/placeholder.png'} alt={product.name} className="w-full h-40 sm:h-48 lg:h-56 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[calc(100%-1rem)]">
                        {product.badges.slice(0, 3).map((badge, badgeIndex) => <Badge key={`${product.id || productIndex}-badge-${badgeIndex}`} className={`${getBadgeColor(badge)} text-white px-2 py-1 text-xs shadow-sm`}>
                            {badge}
                          </Badge>)}
                      </div>
                      
                      {/* Free Offer Badge */}
                      {product.offer && <div className="absolute bottom-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded shadow-sm">
                          Free Offer
                        </div>}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {product.formattedPrice || `₹${product.price}`}
                      </p>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground">{product.quantity}</p>
                      
                      {/* Rating and Price Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => <Star key={`${product.id || productIndex}-star-${i}`} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                          </div>
                          <span className="text-xs text-muted-foreground">({product.reviews_count || product.reviewCount})</span>
                        </div>
                        <span className="text-sm sm:text-lg font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Flavor Tags */}
                      <div className="flex flex-wrap gap-1">
                        {(product.taste_notes || []).slice(0, 2).map((note, noteIndex) => <Badge key={`${product.id || productIndex}-note-${noteIndex}`} variant="secondary" className="text-xs px-1 py-0">
                            {note}
                          </Badge>)}
                      </div>
                      
                      <Link to={`/product/${product.slug}`} className="block">
                        <Button className="w-full text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground py-2">
                          Add to Cart
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
            
            {/* Infinite Scroll Loading Trigger */}
            {hasMore && <div ref={loadMoreRef} className="flex justify-center py-8">
                {loading && <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading more products...</span>
                  </div>}
              </div>}
            
            {/* End of Products Indicator */}
            {!hasMore && displayedProducts.length > 0 && <div className="text-center py-8">
                <p className="text-muted-foreground">You've seen all products!</p>
              </div>}
            
            {/* Empty State */}
            {displayedProducts.length === 0 && displayedProducts.length === 0 && <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No products found matching your filters</p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};
export default Shop;