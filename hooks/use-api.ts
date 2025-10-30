import { useState, useEffect, useCallback } from 'react';
import { api, Product, Category, User, Cart, Order } from '@/lib/api';

// Хук для работы с товарами
export function useProducts(params?: {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching products with params:', params);
      const response = await api.getProducts(params);
      console.log('API response:', response);
      setProducts(response.products || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, params.sortBy, params.sortOrder, params.categoryId, params.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, pagination, refetch: fetchProducts };
}

// Хук для работы с одним товаром
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProduct(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

// Хук для работы с товаром по slug
export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProductBySlug(slug);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

// Хук для работы с категориями
export function useCategories(tree = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories(tree);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  }, [tree]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

// Хук для работы с корзиной
export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      await api.addToCart(productId, quantity);
      await fetchCart(); // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления в корзину');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateCartItem(productId, quantity);
      await fetchCart(); // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления корзины');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.removeFromCart(productId);
      await fetchCart(); // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления из корзины');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.clearCart();
      await fetchCart(); // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка очистки корзины');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch: fetchCart
  };
}


// Хук для работы с пользователем
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Начинаем с true
  const [error, setError] = useState<string | null>(null);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false); // Устанавливаем false после загрузки из localStorage
      } catch (err) {
        console.error('Ошибка парсинга сохраненного пользователя:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setLoading(false); // Устанавливаем false при ошибке
      }
    } else {
      setLoading(false); // Устанавливаем false если нет сохраненных данных
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Не показываем ошибку, если пользователь не авторизован
      if (err instanceof Error && !err.message.includes('401')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${api.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${api.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка выхода');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.baseURL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления профиля');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления профиля');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refetch: fetchUser
  };
}

// Хук для работы с заказами
export function useOrders(params?: {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Требуется авторизация') || err.message.includes('Недействительный токен') || err.message.includes('401') || err.message.includes('403'))) {
        // Тихо игнорируем неавторизованное состояние: очистка токена уже сделана в api
        setOrders([]);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки заказов');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllOrders(params);
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Требуется авторизация') || err.message.includes('Недействительный токен') || err.message.includes('401') || err.message.includes('403'))) {
        setOrders([]);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки заказов');
      }
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.sortBy, params?.sortOrder, params?.page, params?.limit]);

  const createOrder = useCallback(async (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createOrder(orderData);
      await fetchOrders(); // Обновляем список заказов
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  const cancelOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.cancelOrder(orderId);
      await fetchOrders(); // Обновляем список заказов
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отмены заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    if (params) {
      // Добавляем небольшую задержку для дебаунса
      const timer = setTimeout(() => {
        fetchAllOrders();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      fetchOrders();
    }
  }, [params?.search, params?.sortBy, params?.sortOrder, params?.page, params?.limit]);

  return {
    orders,
    loading,
    error,
    pagination,
    createOrder,
    cancelOrder,
    refetch: fetchOrders,
    refetchAll: fetchAllOrders
  };
}

// Хук для популярных товаров на основе заказов
export function usePopularProducts() {
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const products = await api.getPopularProducts();
      setPopularProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки популярных товаров');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularProducts();
  }, [fetchPopularProducts]);

  return { popularProducts, loading, error, refetch: fetchPopularProducts };
}

// Хук для поиска
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getProducts({ search: searchQuery, limit: 10 });
      setResults(response.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search,
    clearSearch
  };
}

