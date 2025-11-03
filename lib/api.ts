// API клиент для интеграции с backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Загружаем токен при каждом запросе
    this.loadToken();
    
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Добавляем session ID для гостей
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('session_id', sessionId);
      }
      headers['X-Session-Id'] = sessionId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const status = response.status;
        const errorData = await response.json().catch(() => ({}));

        // Если токен недействителен/просрочен — очищаем и кидаем понятную ошибку
        if (status === 401 || status === 403) {
          this.clearToken();
          throw new Error(errorData.error || 'Требуется авторизация');
        }

        throw new Error(errorData.error || `HTTP error! status: ${status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Товары
  async getProducts(params?: {
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
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async createProduct(productData: Partial<Product>) {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/slug/${slug}`);
  }

  async getProductsByCategory(categoryId: string, page = 1, limit = 20) {
    return this.request(`/products/category/${categoryId}?page=${page}&limit=${limit}`);
  }

  async getSimilarProducts(id: string) {
    return this.request(`/products/${id}/similar`);
  }

  // Категории
  async getCategories(tree = false) {
    return this.request(`/categories${tree ? '?tree=true' : ''}`);
  }

  async createCategory(categoryData: Partial<Category>) {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: Partial<Category>) {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async getCategoryBySlug(slug: string) {
    return this.request(`/categories/slug/${slug}`);
  }

  async getRootCategories() {
    return this.request('/categories/root');
  }

  // Пользователи
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.request<{ user: any; token: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.clearToken();
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Адреса
  async addAddress(address: any) {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateAddress(addressId: string, address: any) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  async deleteAddress(addressId: string) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(addressId: string) {
    return this.request(`/users/addresses/${addressId}/default`, {
      method: 'PUT',
    });
  }

  // Корзина
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId: string, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  async mergeCarts(userId: string, sessionId: string) {
    return this.request('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId }),
    });
  }

  // Заказы
  async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async getOrderByNumber(orderNumber: string) {
    return this.request(`/orders/number/${orderNumber}`);
  }

  async cancelOrder(id: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAllOrders(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const query = searchParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getPopularProducts() {
    return this.request('/orders/admin/popular-products');
  }

  // Telegram настройки
  async getTelegramSettings() {
    return this.request('/telegram');
  }

  async saveTelegramSettings(settings: {
    botToken: string;
    chatId: string;
    isEnabled: boolean;
  }) {
    return this.request('/telegram', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async updateTelegramSettings(settings: {
    botToken?: string;
    chatId?: string;
    isEnabled?: boolean;
  }) {
    return this.request('/telegram', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async testTelegramConnection(botToken: string, chatId: string) {
    return this.request('/telegram/test', {
      method: 'POST',
      body: JSON.stringify({ botToken, chatId }),
    });
  }

  // Утилиты
  async healthCheck() {
    return this.request('/health');
  }
}

// Создаем единственный экземпляр API клиента
export const api = new ApiClient(API_BASE_URL);

// Экспортируем типы для TypeScript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  slug: string;
  images: string[];
  badge?: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  weight?: string;
  dimensions?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    isActive: boolean;
  };
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

