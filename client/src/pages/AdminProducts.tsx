import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import adminAPI from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Loader2, ChevronDown, Info, Video, Package, Tag, DollarSign, Star, TrendingUp, Filter, Grid3X3, List, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for product form fields
interface Origin {
  garden_name?: string;
  elevation_ft?: number | string;
  harvest_date?: string;
}

interface Brewing {
  temperature_c?: number | string;
  time_min?: number | string;
  method?: string;
}

interface ScanToBrew {
  video_url?: string;
  steps?: string[];
  timer_seconds?: number | string;
}

interface ProductFormData {
  _id: string;
  name: string;
  subtitle: string;
  category: string;
  type: string[];
  price: number;
  quantity: string;
  description: string;
  images: (string | File)[];
  offer: string;
  gift_included: string;
  badges: string[];
  rating: number;
  reviewCount: number;
  taste_notes: string[];
  packaging: string;
  region: string;
  flush: string;
  origin: Origin;
  brewing: Brewing;
  scan_to_brew: ScanToBrew;
  qr_code: string;
  tags: string[];
}

interface Product {
  _id?: string;
  id?: string | null;
  slug?: string;
  name: string;
  subtitle: string;
  category: string;
  type: string[];
  price: number;
  quantity: string;
  description: string;
  images: string[];
  offer: string;
  gift_included?: string;
  badges: string[];
  rating: number;
  reviewCount: number;
  taste_notes: string[];
  packaging: string;
  region: string;
  flush: string;
  origin: Origin;
  brewing: Brewing;
  scan_to_brew: ScanToBrew;
  qr_code: string;
  tags: string[];
  formattedPrice?: string;
}

interface ApiParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  type?: string;
  badge?: string;
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedBadge, setSelectedBadge] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    _id: "",
    name: "",
    subtitle: "",
    category: "",
    type: [],
    price: 0,
    quantity: "",
    description: "",
    images: [],
    offer: "",
    gift_included: "No",
    badges: [],
    rating: 0,
    reviewCount: 0,
    taste_notes: [],
    packaging: "",
    region: "",
    flush: "",
    origin: { garden_name: "", elevation_ft: "", harvest_date: "" },
    brewing: { temperature_c: "", time_min: "", method: "" },
    scan_to_brew: { video_url: "", steps: [], timer_seconds: "" },
    qr_code: "",
    tags: [],
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper function to format date for input
  function toDateInputValue(dateString: string | undefined): string {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  }

  const handleNextStep = (isEdit = false) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = (isEdit = false) => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  function handleCloseAddDialog() {
    setIsAddDialogOpen(false);
    setCurrentStep(1);
    setFormErrors({});
  }

  function handleCloseEditDialog() {
    setIsEditDialogOpen(false);
    setCurrentStep(1);
    setFormErrors({});
    setSelectedProduct(null);
  }

  // Fetch all products for client-side filtering
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const fetchAllProducts = useCallback(async () => {
    try {
  
      const response = await adminAPI.getAllProducts({ page: 1, limit: 1000 });
              setAllProducts(response.data.products || []);
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
    }
  }, []);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.subtitle.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Type filter (array field)
    if (selectedType) {
      filtered = filtered.filter(product => 
        Array.isArray(product.type) && product.type.includes(selectedType)
      );
    }
    
    // Badge filter (array field)
    if (selectedBadge) {
      filtered = filtered.filter(product => 
        Array.isArray(product.badges) && product.badges.includes(selectedBadge)
      );
    }
    

    
    return filtered;
  }, [allProducts, searchTerm, selectedCategory, selectedType, selectedBadge]);

  // Calculate total pages based on filtered products
  const totalPages = Math.ceil(filteredProducts.length / 10);

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Fetch products (now just fetches all products once)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      await fetchAllProducts();
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAllProducts, toast]);

  // Fetch categories (from products list)
  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getProductStats();

      
      if (response.data.productsByCategory) {
        // Use ensureArray to convert any malformed category data to proper array
        const categoryKeys = ensureArray(Object.keys(response.data.productsByCategory), 'categories');

        
        // Filter out numeric keys and ensure we have proper category names
        const validCategories = categoryKeys.filter(cat => 
          typeof cat === 'string' && 
          cat !== '0' && 
          cat !== '1' && 
          cat !== '2' && 
          cat !== '3' &&
          cat.length > 0
        );
        
        if (validCategories.length > 0) {
          setCategories(validCategories as string[]);
        } else {
          // Fallback to predefined categories if no valid categories found
          const defaultCategories = ['Trial Pack', 'Gift Box', 'Full Size'];

          setCategories(defaultCategories);
        }
      } else {
        // Fallback to predefined categories
        const defaultCategories = ['Trial Pack', 'Gift Box', 'Full Size'];

        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Fallback to predefined categories on error
      const defaultCategories = ['Trial Pack', 'Gift Box', 'Full Size'];

      setCategories(defaultCategories);
    }
  };

  // Fetch types and badges from products
  const fetchTypesAndBadges = async () => {
    try {
      const response = await adminAPI.getAllProducts({ page: 1, limit: 1000 });
      const allProducts = response.data.products || [];
      
      // Extract unique types
      const allTypes = new Set<string>();
      allProducts.forEach(product => {
        if (Array.isArray(product.type)) {
          product.type.forEach(type => {
            if (type && typeof type === 'string') {
              allTypes.add(type);
            }
          });
        }
      });
      
      // Extract unique badges
      const allBadges = new Set<string>();
      allProducts.forEach(product => {
        if (Array.isArray(product.badges)) {
          product.badges.forEach(badge => {
            if (badge && typeof badge === 'string') {
              allBadges.add(badge);
            }
          });
        }
      });
      
      const typesArray = Array.from(allTypes).sort();
      const badgesArray = Array.from(allBadges).sort();
      

      
      setTypes(typesArray);
      setBadges(badgesArray);
    } catch (error) {
      console.error("Failed to fetch types and badges:", error);
      // Set default values
      setTypes(['Black', 'Green', 'Masala', 'Herbal']);
      setBadges(['New', 'Bestseller', 'Organic', 'Gift']);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);



  useEffect(() => {
    fetchCategories();
    fetchTypesAndBadges();
  }, []);

  const handleSearch = (value: string) => {

    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {

    setSelectedCategory(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {

    setSelectedType(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleBadgeChange = (value: string) => {

    setSelectedBadge(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {

    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedBadge('');
    setCurrentPage(1);
  };

  const handleRemoveImage = (index: number) => {

    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleAddProduct = () => {
    setFormData({
      _id: "",
      name: "",
      subtitle: "",
      category: "",
      type: [],
      price: 0,
      quantity: "",
      description: "",
      images: [],
      offer: "",
      gift_included: "No",
      badges: [],
      rating: 0,
      reviewCount: 0,
      taste_notes: [],
      packaging: "",
      region: "",
      flush: "",
      origin: { garden_name: "", elevation_ft: "", harvest_date: "" },
      brewing: { temperature_c: "", time_min: "", method: "" },
      scan_to_brew: { video_url: "", steps: [], timer_seconds: "" },
      qr_code: "",
      tags: [],
    });
    setIsAddDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {

    // Map 'Full-Sized' to 'Full Size' for category
    let category = product.category;
    if (category === 'Full-Sized') category = 'Full Size';
    const allowedCategories = ['Trial Pack', 'Gift Box', 'Full Size'];
    setSelectedProduct({ ...product, _id: product._id || (product.id && product.id !== null ? product.id : undefined) });
    setFormData({
      _id: product._id || "",
      name: product.name,
      subtitle: product.subtitle,
      category: allowedCategories.includes(category) ? category : '',
      type: product.type || [],
      price: product.price,
      quantity: product.quantity,
      description: product.subtitle,
      images: product.images || [],
      offer: product.offer || "",
      gift_included: product.gift_included || "No",
      badges: product.badges || [],
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      taste_notes: product.taste_notes || [],
      packaging: product.packaging || "",
      region: product.region || "",
      flush: product.flush || "",
      origin: {
        garden_name: product.origin?.garden_name || "",
        elevation_ft: product.origin?.elevation_ft || "",
        harvest_date: toDateInputValue(product.origin?.harvest_date),
      },
      brewing: {
        temperature_c: product.brewing?.temperature_c || "",
        time_min: product.brewing?.time_min || "",
        method: product.brewing?.method || "",
      },
      scan_to_brew: {
        video_url: product.scan_to_brew?.video_url || "",
        steps: product.scan_to_brew?.steps || [],
        timer_seconds: product.scan_to_brew?.timer_seconds || "",
      },
      qr_code: product.qr_code || "",
      tags: product.tags || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await adminAPI.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Helper function to clean empty values and fix malformed arrays
  const cleanEmptyValues = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }
    
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === '' || value === '""' || value === '""""') {
        cleaned[key] = undefined;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if this looks like a malformed array (object with numeric keys or mixed keys)
        const keys = Object.keys(value);
        const hasNumericKeys = keys.some(k => !isNaN(Number(k)));
        const hasStringKeys = keys.some(k => isNaN(Number(k)) && k !== '0' && k !== '1' && k !== '2');
        
        if (hasNumericKeys || (keys.length > 0 && !hasStringKeys)) {
          // Convert malformed array object to proper array
    
          const arrayValues = Object.values(value).filter(v => v !== undefined && v !== null && v !== '');

          cleaned[key] = arrayValues;
        } else {
          cleaned[key] = cleanEmptyValues(value);
        }
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // Helper function to ensure arrays are properly formatted
  const ensureArray = (value: unknown, fieldName: string): unknown[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      const arrayValues = Object.values(value).filter(v => v !== undefined && v !== null && v !== '');
      return arrayValues;
    }
    return [];
  };

  // Helper function to validate and convert data types
  const validateProductData = (data: unknown): unknown => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const validated = { ...data } as Record<string, unknown>;
    
    // Remove fields that shouldn't be sent in updates
    delete validated._id;
    delete validated.id;
    delete validated.slug;
    delete validated.formattedPrice;
    
    // Ensure arrays are properly formatted
    validated.type = ensureArray(validated.type, 'type');
    validated.badges = ensureArray(validated.badges, 'badges');
    validated.taste_notes = ensureArray(validated.taste_notes, 'taste_notes');
    validated.tags = ensureArray(validated.tags, 'tags');
    validated.images = ensureArray(validated.images, 'images');
    
    // Convert string numbers to actual numbers
    if (validated.price && typeof validated.price === 'string') {
      validated.price = Number(validated.price);
    }
    if (validated.rating && typeof validated.rating === 'string') {
      validated.rating = Number(validated.rating);
    }
    if (validated.reviewCount && typeof validated.reviewCount === 'string') {
      validated.reviewCount = Number(validated.reviewCount);
    }
    
    // Handle nested objects
    if (validated.origin && typeof validated.origin === 'object' && validated.origin !== null) {
      const origin = validated.origin as Record<string, unknown>;
      if (origin.elevation_ft && typeof origin.elevation_ft === 'string' && origin.elevation_ft !== '') {
        origin.elevation_ft = Number(origin.elevation_ft);
      }
      if (origin.harvest_date === '') {
        origin.harvest_date = undefined;
      }
    }
    
    if (validated.brewing && typeof validated.brewing === 'object' && validated.brewing !== null) {
      const brewing = validated.brewing as Record<string, unknown>;
      if (brewing.temperature_c && typeof brewing.temperature_c === 'string' && brewing.temperature_c !== '') {
        brewing.temperature_c = Number(brewing.temperature_c);
      }
      if (brewing.time_min && typeof brewing.time_min === 'string' && brewing.time_min !== '') {
        brewing.time_min = Number(brewing.time_min);
      }
    }
    
    if (validated.scan_to_brew && typeof validated.scan_to_brew === 'object' && validated.scan_to_brew !== null) {
      const scanToBrew = validated.scan_to_brew as Record<string, unknown>;
      if (scanToBrew.timer_seconds && typeof scanToBrew.timer_seconds === 'string' && scanToBrew.timer_seconds !== '') {
        scanToBrew.timer_seconds = Number(scanToBrew.timer_seconds);
      }
      // Ensure scan_to_brew.steps is an array
      scanToBrew.steps = ensureArray(scanToBrew.steps, 'scan_to_brew.steps');
    }
    
    return validated;
  };

  const handleAddProductSubmit = async () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Product name is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';
    if (!formData.price || formData.price <= 0) errors.price = 'Price must be greater than 0.';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setFormLoading(true);
    try {
      // Clean and validate data

      const cleanedData = cleanEmptyValues(formData) as ProductFormData;
      
      const validatedData = validateProductData(cleanedData) as ProductFormData;
      

      // Ensure all required fields are present
      const finalData = {
        ...validatedData,
        qr_code: validatedData.qr_code || `https://yellowtea.in/brew/${validatedData.name?.toLowerCase().replace(/\s+/g, '-')}`,
        scan_to_brew: {
          video_url: validatedData.scan_to_brew?.video_url || '',
          steps: ensureArray(validatedData.scan_to_brew?.steps, 'final_scan_to_brew.steps'),
          timer_seconds: validatedData.scan_to_brew?.timer_seconds || 300
        },
        // Ensure all required fields have default values
        description: validatedData.description || validatedData.subtitle || '',
        offer: validatedData.offer || '',
        gift_included: validatedData.gift_included || 'No',
        packaging: validatedData.packaging || 'Whole Leaf',
        region: validatedData.region || '',
        flush: validatedData.flush || 'Summer',
        // Final array validation
        type: ensureArray(validatedData.type, 'final_type'),
        badges: ensureArray(validatedData.badges, 'final_badges'),
        taste_notes: ensureArray(validatedData.taste_notes, 'final_taste_notes'),
        tags: ensureArray(validatedData.tags, 'final_tags'),
        images: ensureArray(validatedData.images, 'final_images')
      };
      
      await adminAPI.createProduct(finalData);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setIsAddDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error creating product:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to add product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProductSubmit = async () => {
    const productId = selectedProduct?._id || selectedProduct?.id;
    if (!selectedProduct || !productId) {
      toast({
        title: "Error",
        description: "This product cannot be edited because it has no valid ID.",
        variant: "destructive",
      });
      return;
    }
    setFormLoading(true);
    try {
      // Clean and validate data

      const cleanedData = cleanEmptyValues(formData) as ProductFormData;

      const validatedData = validateProductData(cleanedData) as ProductFormData;
      

      // Ensure all required fields are present
      const finalData = {
        ...validatedData,
        qr_code: validatedData.qr_code || `https://yellowtea.in/brew/${validatedData.name?.toLowerCase().replace(/\s+/g, '-')}`,
        scan_to_brew: {
          video_url: validatedData.scan_to_brew?.video_url || '',
          steps: ensureArray(validatedData.scan_to_brew?.steps, 'final_scan_to_brew.steps'),
          timer_seconds: validatedData.scan_to_brew?.timer_seconds || 300
        },
        // Ensure all required fields have default values
        description: validatedData.description || validatedData.subtitle || '',
        offer: validatedData.offer || '',
        gift_included: validatedData.gift_included || 'No',
        packaging: validatedData.packaging || 'Whole Leaf',
        region: validatedData.region || '',
        flush: validatedData.flush || 'Summer',
        // Final array validation
        type: ensureArray(validatedData.type, 'final_type'),
        badges: ensureArray(validatedData.badges, 'final_badges'),
        taste_notes: ensureArray(validatedData.taste_notes, 'final_taste_notes'),
        tags: ensureArray(validatedData.tags, 'final_tags'),
        images: ensureArray(validatedData.images, 'final_images')
      };
      
      await adminAPI.updateProduct(productId, finalData);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('❌ Error updating product:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenVideoModal = (url: string) => {
    setVideoUrl(url);
    setIsVideoModalOpen(true);
  };
  
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setVideoUrl(null);
    if (videoRef.current) videoRef.current.pause();
  };

  const handleOpenDetailsModal = (product: Product) => {
    setDetailsProduct(product);
    setIsDetailsModalOpen(true);
  };
  
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setDetailsProduct(null);
  };

  const getStatusBadge = (product: Product) => {
    if (product.price > 0) {
      return <Badge className="bg-green-500 text-white">Active</Badge>;
    }
    return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
  };

  // Sort paginated products
  const sortedProducts = React.useMemo(() => {
    return [...paginatedProducts].sort((a, b) => {
      let aValue: string | number = a[sortBy] as string | number;
      let bValue: string | number = b[sortBy] as string | number;
      
      if (sortBy === 'price') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortBy === 'rating') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
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
  }, [paginatedProducts, sortBy, sortOrder]);

  // Update products when sorted products change
  useEffect(() => {
    setProducts(sortedProducts);
  }, [sortedProducts]);

  const handleSort = (field: 'name' | 'price' | 'category' | 'rating') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading && allProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
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
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Grid
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Products
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, category, tags..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Category
              </Label>
              <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(Boolean).map((category) => {
              
                    return (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Type
              </Label>
              <Select value={selectedType || 'all'} onValueChange={handleTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.filter(Boolean).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="badge" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Badge
              </Label>
              <Select value={selectedBadge || 'all'} onValueChange={handleBadgeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Badges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Badges</SelectItem>
                  {badges.filter(Boolean).map((badge) => (
                    <SelectItem key={badge} value={badge}>
                      {badge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Sort By
              </Label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-') as ['name' | 'price' | 'category' | 'rating', 'asc' | 'desc'];
                setSortBy(field);
                setSortOrder(order);
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                  <SelectItem value="rating-desc">Rating (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({sortedProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <button 
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('category')}
                      >
                        <Tag className="h-4 w-4" />
                        Category
                        {sortBy === 'category' && (
                          <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <button 
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                        onClick={() => handleSort('price')}
                      >
                        <DollarSign className="h-4 w-4" />
                        Price
                        {sortBy === 'price' && (
                          <ChevronDown className={`h-3 w-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Rating
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Status
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => {
                    const imageSrc = Array.isArray(product.images) && typeof product.images[0] === 'string'
                      ? product.images[0]
                      : "/placeholder.svg";
                    return (
                      <tr key={product._id || product.slug} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={imageSrc} alt={product.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {product.name}
                                {Array.isArray(product.badges) && product.badges.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.badges[0]}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{product.subtitle}</div>
                              {product.offer && (
                                <div className="text-xs text-orange-600 font-medium mt-1">{product.offer}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-green-600">
                            {product.formattedPrice || `₹${product.price}`}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm">{product.rating || 0}</span>
                            <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(product)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {product.scan_to_brew?.video_url && (
                              <Button variant="ghost" size="icon" onClick={() => handleOpenVideoModal(product.scan_to_brew.video_url)} title="Preview Video">
                                <Video className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDetailsModal(product)} title="Details">
                              <Info className="h-4 w-4 text-gray-700" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product._id || '')} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map((product) => {
                const imageSrc = Array.isArray(product.images) && typeof product.images[0] === 'string'
                  ? product.images[0]
                  : "/placeholder.svg";
                return (
                  <Card key={product._id || product.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={imageSrc} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.subtitle}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="font-semibold text-green-600">{product.formattedPrice || `₹${product.price}`}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm">{product.rating || 0}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                        </div>
                        {product.offer && (
                          <div className="text-xs text-orange-600 font-medium">{product.offer}</div>
                        )}
                        <div className="flex items-center gap-1 pt-2">
                          {product.scan_to_brew?.video_url && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenVideoModal(product.scan_to_brew.video_url)} title="Preview Video">
                              <Video className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDetailsModal(product)} title="Details">
                            <Info className="h-4 w-4 text-gray-700" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product._id || '')} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={handleCloseAddDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col overflow-y-auto p-16">
          <DialogHeader className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 pb-2 ">
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill out the form to add a new product.</DialogDescription>
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={currentStep === 1 ? 'font-bold text-green-700' : 'text-gray-400'}>Basic Info</span>
              <span className={currentStep === 2 ? 'font-bold text-green-700' : 'text-gray-400'}>Details</span>
              <span className={currentStep === 3 ? 'font-bold text-green-700' : 'text-gray-400'}>Advanced</span>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 h-[80vh] overflow-y-auto py-4 px-1">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trial Pack">Trial Pack</SelectItem>
                        <SelectItem value="Gift Box">Gift Box</SelectItem>
                        <SelectItem value="Full Size">Full Size</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && <div className="text-red-500 text-xs mt-1">{formErrors.category}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="offer">Offer</Label>
                    <Input id="offer" value={formData.offer || ''} onChange={(e) => setFormData({ ...formData, offer: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badges">Badges (comma separated)</Label>
                    <Input id="badges" value={Array.isArray(formData.badges) ? formData.badges.join(', ') : ''} onChange={(e) => setFormData({ ...formData, badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
                    {formErrors.price && <div className="text-red-500 text-xs mt-1">{formErrors.price}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input id="quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="packaging">Packaging</Label>
                    <Input id="packaging" value={formData.packaging || ''} onChange={(e) => setFormData({ ...formData, packaging: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type (comma separated)</Label>
                    <Input id="type" value={Array.isArray(formData.type) ? formData.type.join(', ') : ''} onChange={(e) => setFormData({ ...formData, type: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taste_notes">Taste Notes (comma separated)</Label>
                    <Input id="taste_notes" value={Array.isArray(formData.taste_notes) ? formData.taste_notes.join(', ') : ''} onChange={(e) => setFormData({ ...formData, taste_notes: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input id="region" value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flush">Flush</Label>
                    <Input id="flush" value={formData.flush || ''} onChange={(e) => setFormData({ ...formData, flush: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="images">Images</Label>
                    <Input id="images" type="file" multiple accept="image/*" onChange={e => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setFormData({ ...formData, images: [...formData.images, ...files] });
                    }} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(formData.images) && formData.images.length > 0 && formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 group">
                          <img
                            src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                            alt={`preview-${idx}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_url">Product Video URL</Label>
                    <Input id="video_url" value={formData.scan_to_brew?.video_url || ''} onChange={(e) => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, video_url: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="qr_code">QR Code URL</Label>
                    <Input id="qr_code" value={formData.qr_code || ''} onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="font-bold text-lg border-b pb-2">Origin</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="origin-garden">Garden Name</Label>
                    <Input id="origin-garden" value={formData.origin.garden_name || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, garden_name: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="origin-elevation">Elevation (ft)</Label>
                    <Input id="origin-elevation" type="number" value={formData.origin.elevation_ft || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, elevation_ft: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="origin-harvest">Harvest Date</Label>
                    <Input id="origin-harvest" type="date" value={formData.origin.harvest_date || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, harvest_date: e.target.value } })} />
                  </div>
                </div>
                <div className="font-bold text-lg border-b pb-2 mt-6">Brewing</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="brewing-temp">Temperature (°C)</Label>
                    <Input id="brewing-temp" type="number" value={formData.brewing.temperature_c || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, temperature_c: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="brewing-time">Time (min)</Label>
                    <Input id="brewing-time" type="number" value={formData.brewing.time_min || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, time_min: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="brewing-method">Method</Label>
                    <Input id="brewing-method" value={formData.brewing.method || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, method: e.target.value } })} />
                  </div>
                </div>
                <div className="font-bold text-lg border-b pb-2 mt-6">Scan to Brew</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scan-video">Video URL</Label>
                    <Input id="scan-video" value={formData.scan_to_brew.video_url || ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, video_url: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="scan-steps">Steps (comma separated)</Label>
                    <Input id="scan-steps" value={Array.isArray(formData.scan_to_brew.steps) ? formData.scan_to_brew.steps.join(', ') : ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, steps: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} />
                  </div>
                  <div>
                    <Label htmlFor="scan-timer">Timer (seconds)</Label>
                    <Input id="scan-timer" type="number" value={formData.scan_to_brew.timer_seconds || ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, timer_seconds: e.target.value } })} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 pt-4 flex justify-between gap-2 border-t mt-2">
            <Button variant="outline" onClick={handleCloseAddDialog} disabled={formLoading}>Cancel</Button>
            {currentStep > 1 && <Button variant="outline" onClick={() => handlePrevStep(false)} disabled={formLoading}>Back</Button>}
            {currentStep < 3 ? (
              <Button onClick={() => handleNextStep(false)} disabled={formLoading}>Next</Button>
            ) : (
              <Button onClick={handleAddProductSubmit} disabled={formLoading}>{formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Product</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col overflow-y-auto p-16">
          <DialogHeader className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 pb-2">
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below and save your changes.</DialogDescription>
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={currentStep === 1 ? 'font-bold text-green-700' : 'text-gray-400'}>Basic Info</span>
              <span className={currentStep === 2 ? 'font-bold text-green-700' : 'text-gray-400'}>Details</span>
              <span className={currentStep === 3 ? 'font-bold text-green-700' : 'text-gray-400'}>Advanced</span>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 h-[80vh] overflow-y-auto py-4 px-1">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trial Pack">Trial Pack</SelectItem>
                        <SelectItem value="Gift Box">Gift Box</SelectItem>
                        <SelectItem value="Full Size">Full Size</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && <div className="text-red-500 text-xs mt-1">{formErrors.category}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-subtitle">Subtitle</Label>
                    <Input id="edit-subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-offer">Offer</Label>
                    <Input id="edit-offer" value={formData.offer || ''} onChange={(e) => setFormData({ ...formData, offer: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-badges">Badges (comma separated)</Label>
                    <Input id="edit-badges" value={Array.isArray(formData.badges) ? formData.badges.join(', ') : ''} onChange={(e) => setFormData({ ...formData, badges: e.target.value.split(',').map(b => b.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Price (₹)</Label>
                    <Input id="edit-price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
                    {formErrors.price && <div className="text-red-500 text-xs mt-1">{formErrors.price}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-quantity">Quantity</Label>
                    <Input id="edit-quantity" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-packaging">Packaging</Label>
                    <Input id="edit-packaging" value={formData.packaging || ''} onChange={(e) => setFormData({ ...formData, packaging: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Type (comma separated)</Label>
                    <Input id="edit-type" value={Array.isArray(formData.type) ? formData.type.join(', ') : ''} onChange={(e) => setFormData({ ...formData, type: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                    <Input id="edit-tags" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-taste_notes">Taste Notes (comma separated)</Label>
                    <Input id="edit-taste_notes" value={Array.isArray(formData.taste_notes) ? formData.taste_notes.join(', ') : ''} onChange={(e) => setFormData({ ...formData, taste_notes: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-region">Region</Label>
                    <Input id="edit-region" value={formData.region || ''} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-flush">Flush</Label>
                    <Input id="edit-flush" value={formData.flush || ''} onChange={(e) => setFormData({ ...formData, flush: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-images">Images</Label>
                    <Input id="edit-images" type="file" multiple accept="image/*" onChange={e => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      setFormData({ ...formData, images: [...formData.images, ...files] });
                    }} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(formData.images) && formData.images.length > 0 && formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 group">
                          <img
                            src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                            alt={`preview-${idx}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-video_url">Product Video URL</Label>
                    <Input id="edit-video_url" value={formData.scan_to_brew?.video_url || ''} onChange={(e) => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, video_url: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-qr_code">QR Code URL</Label>
                    <Input id="edit-qr_code" value={formData.qr_code || ''} onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="font-bold text-lg border-b pb-2">Origin</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-origin-garden">Garden Name</Label>
                    <Input id="edit-origin-garden" value={formData.origin.garden_name || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, garden_name: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-origin-elevation">Elevation (ft)</Label>
                    <Input id="edit-origin-elevation" type="number" value={formData.origin.elevation_ft || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, elevation_ft: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-origin-harvest">Harvest Date</Label>
                    <Input id="edit-origin-harvest" type="date" value={formData.origin.harvest_date || ''} onChange={e => setFormData({ ...formData, origin: { ...formData.origin, harvest_date: e.target.value } })} />
                  </div>
                </div>
                <div className="font-bold text-lg border-b pb-2 mt-6">Brewing</div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-brewing-temp">Temperature (°C)</Label>
                    <Input id="edit-brewing-temp" type="number" value={formData.brewing.temperature_c || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, temperature_c: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-brewing-time">Time (min)</Label>
                    <Input id="edit-brewing-time" type="number" value={formData.brewing.time_min || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, time_min: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-brewing-method">Method</Label>
                    <Input id="edit-brewing-method" value={formData.brewing.method || ''} onChange={e => setFormData({ ...formData, brewing: { ...formData.brewing, method: e.target.value } })} />
                  </div>
                </div>
                <div className="font-bold text-lg border-b pb-2 mt-6">Scan to Brew</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-scan-video">Video URL</Label>
                    <Input id="edit-scan-video" value={formData.scan_to_brew.video_url || ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, video_url: e.target.value } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-scan-steps">Steps (comma separated)</Label>
                    <Input id="edit-scan-steps" value={Array.isArray(formData.scan_to_brew.steps) ? formData.scan_to_brew.steps.join(', ') : ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, steps: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} />
                  </div>
                  <div>
                    <Label htmlFor="edit-scan-timer">Timer (seconds)</Label>
                    <Input id="edit-scan-timer" type="number" value={formData.scan_to_brew.timer_seconds || ''} onChange={e => setFormData({ ...formData, scan_to_brew: { ...formData.scan_to_brew, timer_seconds: e.target.value } })} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 pt-4 flex justify-between gap-2 border-t mt-2">
            <Button variant="outline" onClick={handleCloseEditDialog} disabled={formLoading}>Cancel</Button>
            {currentStep > 1 && <Button variant="outline" onClick={() => handlePrevStep(true)} disabled={formLoading}>Back</Button>}
            {currentStep < 3 ? (
              <Button onClick={() => handleNextStep(true)} disabled={formLoading}>Next</Button>
            ) : (
              <Button onClick={handleEditProductSubmit} disabled={formLoading}>{formLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Update Product</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {detailsProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={Array.isArray(detailsProduct.images) && detailsProduct.images[0] ? detailsProduct.images[0] : '/placeholder.svg'} alt={detailsProduct.name} className="w-20 h-20 object-cover rounded shadow" />
                <div>
                  <div className="font-bold text-lg">{detailsProduct.name}</div>
                  <div className="text-sm text-gray-500">{detailsProduct.subtitle}</div>
                  {detailsProduct.offer && <div className="text-xs text-orange-600 font-semibold mt-1">{detailsProduct.offer}</div>}
                  {Array.isArray(detailsProduct.badges) && detailsProduct.badges.map((badge: string, idx: number) => (
                    <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full ml-1">{badge}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold">Category:</span> {detailsProduct.category}</div>
                <div><span className="font-semibold">Price:</span> {detailsProduct.formattedPrice || `₹${detailsProduct.price}`}</div>
                <div><span className="font-semibold">Quantity:</span> {detailsProduct.quantity}</div>
                <div><span className="font-semibold">Type:</span> {Array.isArray(detailsProduct.type) ? detailsProduct.type.join(', ') : ''}</div>
                <div><span className="font-semibold">Tags:</span> {Array.isArray(detailsProduct.tags) ? detailsProduct.tags.join(', ') : ''}</div>
                <div><span className="font-semibold">Taste Notes:</span> {Array.isArray(detailsProduct.taste_notes) ? detailsProduct.taste_notes.join(', ') : ''}</div>
                <div><span className="font-semibold">Packaging:</span> {detailsProduct.packaging}</div>
                <div><span className="font-semibold">Region:</span> {detailsProduct.region}</div>
                <div><span className="font-semibold">Flush:</span> {detailsProduct.flush}</div>
                <div><span className="font-semibold">Offer:</span> {detailsProduct.offer}</div>
                <div><span className="font-semibold">QR Code:</span> {detailsProduct.qr_code}</div>
                <div><span className="font-semibold">Rating:</span> {detailsProduct.rating} ({detailsProduct.reviewCount} reviews)</div>
              </div>
              <div>
                <button className="flex items-center gap-1 text-blue-600 hover:underline" onClick={() => setIsDetailsModalOpen((v) => !v)}>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDetailsModalOpen ? 'rotate-180' : ''}`} />
                  Advanced Fields
                </button>
                {isDetailsModalOpen && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border text-xs overflow-x-auto">
                    <div><b>Origin:</b> <pre className="whitespace-pre-wrap">{JSON.stringify(detailsProduct.origin, null, 2)}</pre></div>
                    <div><b>Brewing:</b> <pre className="whitespace-pre-wrap">{JSON.stringify(detailsProduct.brewing, null, 2)}</pre></div>
                    <div><b>Scan to Brew:</b> <pre className="whitespace-pre-wrap">{JSON.stringify(detailsProduct.scan_to_brew, null, 2)}</pre></div>
                  </div>
                )}
              </div>
              {detailsProduct.scan_to_brew?.video_url && (
                <div>
                  <video src={detailsProduct.scan_to_brew.video_url} controls className="w-full rounded-lg" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Product Video</DialogTitle>
          </DialogHeader>
          {videoUrl ? (
            <div className="flex flex-col items-center">
              <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
            </div>
          ) : (
            <div>No video available.</div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleCloseVideoModal}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts; 