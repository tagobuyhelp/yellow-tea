import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Search as SearchIcon, Filter, X, Star, Heart, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { products, getUniqueCategories, getUniqueTypes, getUniqueFlushes, getUniqueRegions } from '@/data/products';
import type { Product } from '@/types/product';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFlushes, setSelectedFlushes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique filter values
  const categories = getUniqueCategories();
  const types = getUniqueTypes();
  const flushes = getUniqueFlushes();
  const regions = getUniqueRegions();

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          product.tasteNotes.some(note => note.toLowerCase().includes(searchLower)) ||
          product.region.toLowerCase().includes(searchLower) ||
          product.type.some(type => type.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !product.type.some(type => selectedTypes.includes(type))) {
        return false;
      }

      // Flush filter
      if (selectedFlushes.length > 0 && !selectedFlushes.includes(product.flush)) {
        return false;
      }

      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.includes(product.region)) {
        return false;
      }

      // Price filter
      if (priceRange !== 'all') {
        const price = product.price;
        switch (priceRange) {
          case 'under-400':
            if (price >= 400) return false;
            break;
          case '400-600':
            if (price < 400 || price > 600) return false;
            break;
          case 'over-600':
            if (price <= 600) return false;
            break;
        }
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchTerm, selectedCategories, selectedTypes, selectedFlushes, selectedRegions, priceRange, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedFlushes([]);
    setSelectedRegions([]);
    setPriceRange('all');
    setSortBy('name');
  };

  // Toggle filter functions
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleFlush = (flush: string) => {
    setSelectedFlushes(prev => 
      prev.includes(flush) 
        ? prev.filter(f => f !== flush)
        : [...prev, flush]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedTypes.length > 0 || 
                          selectedFlushes.length > 0 || selectedRegions.length > 0 || 
                          priceRange !== 'all' || searchTerm;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Your Perfect Tea</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Search through our premium collection of fresh teas from gardens across India
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by tea name, type, region, or taste notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium mb-3">Category</h4>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Tea Types */}
                    <div>
                      <h4 className="font-medium mb-3">Tea Type</h4>
                      <div className="space-y-2">
                        {types.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleType(type)}
                            />
                            <Label htmlFor={`type-${type}`} className="text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Flush */}
                    <div>
                      <h4 className="font-medium mb-3">Flush</h4>
                      <div className="space-y-2">
                        {flushes.map((flush) => (
                          <div key={flush} className="flex items-center space-x-2">
                            <Checkbox
                              id={`flush-${flush}`}
                              checked={selectedFlushes.includes(flush)}
                              onCheckedChange={() => toggleFlush(flush)}
                            />
                            <Label htmlFor={`flush-${flush}`} className="text-sm">
                              {flush}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Region */}
                    <div>
                      <h4 className="font-medium mb-3">Region</h4>
                      <div className="space-y-2">
                        {regions.map((region) => (
                          <div key={region} className="flex items-center space-x-2">
                            <Checkbox
                              id={`region-${region}`}
                              checked={selectedRegions.includes(region)}
                              onCheckedChange={() => toggleRegion(region)}
                            />
                            <Label htmlFor={`region-${region}`} className="text-sm">
                              {region}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium mb-3">Price Range</h4>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Prices" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prices</SelectItem>
                          <SelectItem value="under-400">Under ₹400</SelectItem>
                          <SelectItem value="400-600">₹400 - ₹600</SelectItem>
                          <SelectItem value="over-600">Over ₹600</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {filteredProducts.length} Tea{filteredProducts.length !== 1 ? 's' : ''} Found
                </h2>
                {searchTerm && (
                  <p className="text-muted-foreground">
                    Results for "{searchTerm}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => toggleCategory(category)}>
                      {category} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="cursor-pointer" onClick={() => toggleType(type)}>
                      {type} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedFlushes.map((flush) => (
                    <Badge key={flush} variant="secondary" className="cursor-pointer" onClick={() => toggleFlush(flush)}>
                      {flush} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {selectedRegions.map((region) => (
                    <Badge key={region} variant="secondary" className="cursor-pointer" onClick={() => toggleRegion(region)}>
                      {region} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {priceRange !== 'all' && (
                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange('all')}>
                      {priceRange === 'under-400' ? 'Under ₹400' : 
                       priceRange === '400-600' ? '₹400-₹600' : 'Over ₹600'}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {product.badges.slice(0, 2).map((badge, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/product/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1">{product.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.type.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-muted-foreground mb-3">
                        <p>{product.region} • {product.flush} Flush</p>
                        <p>{product.quantity}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                        </div>
                      </div>
                      
                      {product.offer && (
                        <p className="text-xs text-green-600 mt-2">{product.offer}</p>
                      )}
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No teas found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find the perfect tea for you.
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
