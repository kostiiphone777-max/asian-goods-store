'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductForm } from '@/components/admin/product-form'
import { CategoryForm } from '@/components/admin/category-form'
import { TelegramSettings } from '@/components/admin/telegram-settings'
import { useUser, useProducts, useOrders, useCategories, usePopularProducts } from '@/hooks/use-api'
import { api } from '@/lib/api'
import { Loader2, Edit, Trash2, PlusCircle, Package, FolderOpen, ShoppingCart, BarChart3, Users, DollarSign, TrendingUp, CheckCircle, XCircle, Clock, Truck, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const { user, loading: userLoading, error: userError } = useUser()
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts({})
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories()
  const { popularProducts, loading: popularProductsLoading, error: popularProductsError } = usePopularProducts()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Состояние для поиска и сортировки заказов
  const [orderSearch, setOrderSearch] = useState('')
  const [orderSortBy, setOrderSortBy] = useState('createdAt')
  const [orderSortOrder, setOrderSortOrder] = useState<'asc' | 'desc'>('desc')

  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders, refetchAll: refetchAllOrders } = useOrders({
    search: orderSearch,
    sortBy: orderSortBy,
    sortOrder: orderSortOrder
  })

  useEffect(() => {
    // Ждем загрузки пользователя
    if (userLoading) return;
    
    // Если пользователь не авторизован или не админ - редиректим с небольшой задержкой
    if (!user || user.role !== 'admin') {
      const timer = setTimeout(() => {
        router.push('/') // Redirect non-admin users
      }, 1000) // 1 секунда задержки
      
      return () => clearTimeout(timer)
    }
    
    // Загружаем все заказы для админа (не блокируем отображение)
    try {
      refetchAllOrders()
    } catch (error) {
      console.warn('Ошибка загрузки заказов:', error)
    }
  }, [user, userLoading, router, refetchAllOrders])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowCategoryForm(true)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleSaveProduct = async (productData) => {
    setLoading(true)
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData)
      } else {
        await api.createProduct(productData)
      }
      setShowProductForm(false)
      refetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Ошибка сохранения товара: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCategory = async (categoryData) => {
    setLoading(true)
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryData)
      } else {
        await api.createCategory(categoryData)
      }
      setShowCategoryForm(false)
      refetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Ошибка сохранения категории: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      setLoading(true)
      try {
        await api.deleteProduct(productId)
        refetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Ошибка удаления товара: ' + (error.message || 'Неизвестная ошибка'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      setLoading(true)
      try {
        await api.deleteCategory(categoryId)
        refetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Ошибка удаления категории: ' + (error.message || 'Неизвестная ошибка'))
      } finally {
        setLoading(false)
      }
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true)
    try {
      await api.updateOrderStatus(orderId, newStatus)
      refetchAllOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Ошибка обновления статуса заказа: ' + (error.message || 'Неизвестная ошибка'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Проверка прав доступа...</p>
          <p className="text-sm text-muted-foreground">Загружаем данные пользователя</p>
        </div>
      </div>
    )
  }

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Загрузка данных админ-панели...</p>
          <p className="text-sm text-muted-foreground">Получаем товары и категории</p>
        </div>
      </div>
    )
  }

  if (userError || productsError || categoriesError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Ошибка загрузки данных</h1>
        <div className="text-center space-y-2">
          {userError && <p className="text-red-600">Ошибка пользователя: {userError}</p>}
          {productsError && <p className="text-red-600">Ошибка товаров: {productsError}</p>}
          {categoriesError && <p className="text-red-600">Ошибка категорий: {categoriesError}</p>}
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Перезагрузить страницу
        </Button>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground mb-4">
            У вас нет прав для доступа к админ-панели
          </p>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (showProductForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => setShowProductForm(false)}
            loading={loading}
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (showCategoryForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryForm
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setShowCategoryForm(false)}
            loading={loading}
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8">Админ-панель</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Категории
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Заказы
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {products.filter(p => p.isActive).length} активных
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{products.filter(p => p.badge === 'Новинка').length} новинок
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Категории</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {categories.filter(c => c.isActive).length} активных
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center text-xs text-blue-600">
                      <FolderOpen className="h-3 w-3 mr-1" />
                      {categories.filter(c => !c.parentId).length} основных
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Заказы</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {ordersError ? (
                    <div className="text-center">
                      <div className="text-sm text-red-600 mb-2">Ошибка загрузки заказов</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => refetchAllOrders()}
                      >
                        Повторить
                      </Button>
                    </div>
                  ) : ordersLoading ? (
                    <div className="text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      <div className="text-xs text-muted-foreground">Загрузка...</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{orders?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {orders?.filter(o => o.status === 'delivered').length || 0} доставлено
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {orders?.filter(o => o.status === 'pending').length || 0} ожидают
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(orders || []).reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()} ₽
                  </div>
                  <p className="text-xs text-muted-foreground">
                    За все время
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {(orders || []).filter(o => o.status === 'delivered').length * 1000} ₽ в месяц
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Дополнительная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(orders || []).length > 0 
                      ? Math.round((orders || []).reduce((sum, order) => sum + (order.total || 0), 0) / (orders || []).length).toLocaleString()
                      : 0} ₽
                  </div>
                  <p className="text-xs text-muted-foreground">
                    За все заказы
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Товары на складе</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce((sum, product) => sum + (product.stock || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    единиц товара
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(orders || []).length > 0 ? Math.round(((orders || []).filter(o => o.status === 'delivered').length / (orders || []).length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Успешных заказов
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Последние заказы</CardTitle>
                  <CardDescription>5 последних заказов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(orders || []).slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">#{order.orderNumber}</p>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(order.status)}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items?.length || 0} товар(ов)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{order.total?.toLocaleString()} ₽</p>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod === 'card' ? '💳 Карта' : '💵 Наличные'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(orders || []).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Заказов пока нет</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Популярные товары</CardTitle>
                  <CardDescription>Товары на основе количества в заказах</CardDescription>
                </CardHeader>
                <CardContent>
                  {popularProductsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Загрузка популярных товаров...</span>
                    </div>
                  ) : popularProductsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2">Ошибка загрузки популярных товаров</p>
                      <p className="text-sm text-muted-foreground">{popularProductsError}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularProducts.length > 0 ? (
                        popularProducts.slice(0, 5).map((product) => (
                          <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images?.[0] ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.price?.toLocaleString()} ₽ • Остаток: {product.stock}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    Продано: {product.totalQuantity}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Заказов: {product.orderCount}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <TrendingUp className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-bold">{product.rating || 0}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Популярность: {product.popularityScore}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Нет данных о популярных товарах</p>
                          <p className="text-sm text-muted-foreground">Популярность рассчитывается на основе заказов</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Управление товарами</CardTitle>
                <Button onClick={handleAddProduct} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Добавить товар
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Фото</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Остаток</TableHead>
                        <TableHead>Рейтинг</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length > 0 ? (
                        products.map((product) => (
                          <TableRow key={product.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images?.[0] ? (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-semibold">{product.name}</p>
                                {product.badge && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {product.badge}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {categories.find(c => c.id === product.categoryId)?.name || 'Неизвестно'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{product.price?.toLocaleString()} ₽</p>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {product.originalPrice.toLocaleString()} ₽
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-600" : "text-red-600"}>
                                  {product.stock}
                                </span>
                                {product.stock === 0 && (
                                  <Badge variant="destructive" className="text-xs">Нет в наличии</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{product.rating || 0}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({product.reviewCount || 0})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? "Активен" : "Неактивен"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                            <div>
                              <p className="text-lg font-medium text-muted-foreground">Товаров пока нет</p>
                              <p className="text-sm text-muted-foreground">Добавьте первый товар в каталог</p>
                            </div>
                            <Button onClick={handleAddProduct} className="gap-2">
                              <PlusCircle className="h-4 w-4" />
                              Добавить первый товар
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Управление категориями</CardTitle>
                <Button onClick={handleAddCategory} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Добавить категорию
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Порядок</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                          <TableCell>{category.sortOrder}</TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Активна" : "Неактивна"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="mr-2"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Нет категорий для отображения.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Управление заказами</CardTitle>
                <CardDescription>Просмотр и управление заказами клиентов</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Поиск и сортировка */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Поиск по клиенту, email или номеру заказа..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={orderSortBy} onValueChange={setOrderSortBy}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Сортировать по" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Дате создания</SelectItem>
                          <SelectItem value="customer">Клиенту</SelectItem>
                          <SelectItem value="total">Сумме</SelectItem>
                          <SelectItem value="status">Статусу</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={orderSortOrder} onValueChange={(value: 'asc' | 'desc') => setOrderSortOrder(value)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Порядок" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">По убыванию</SelectItem>
                          <SelectItem value="asc">По возрастанию</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер заказа</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Товары</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(orders || []).length > 0 ? (
                        (orders || []).map((order) => (
                          <TableRow key={order.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <Link href={`/admin/orders/${order.id}`} className="hover:text-primary transition-colors">
                                <div>
                                  <p className="font-semibold">#{order.orderNumber || order.id.substring(0, 8)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {order.paymentMethod === 'card' ? '💳 Карта' : '💵 Наличные'}
                                  </p>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.shippingAddress?.city}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">
                                  {order.items?.length || 0} товар(ов)
                                </p>
                                {order.items?.[0] && (
                                  <p className="text-xs text-muted-foreground">
                                    {order.items[0].name}
                                    {order.items.length > 1 && ` +${order.items.length - 1} еще`}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{order.total?.toLocaleString()} ₽</p>
                                {order.shippingCost > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{order.shippingCost} ₽ доставка
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={getStatusColor(order.status)}
                                >
                                  {getStatusIcon(order.status)}
                                  {order.status === 'pending' && 'Ожидает'}
                                  {order.status === 'processing' && 'В обработке'}
                                  {order.status === 'shipped' && 'Отправлен'}
                                  {order.status === 'delivered' && 'Доставлен'}
                                  {order.status === 'cancelled' && 'Отменен'}
                                </Badge>
                                {order.trackingNumber && (
                                  <p className="text-xs text-muted-foreground">
                                    {order.trackingNumber}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                  title="Просмотр заказа"
                                >
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <Clock className="h-4 w-4" />
                                  </Link>
                                </Button>
                                {order.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'processing')}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                    title="В обработку"
                                    disabled={loading}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {order.status === 'processing' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                    title="Отправить"
                                    disabled={loading}
                                  >
                                    <Truck className="h-4 w-4" />
                                  </Button>
                                )}
                                {order.status === 'shipped' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                    title="Доставлено"
                                    disabled={loading}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    title="Отменить"
                                    disabled={loading}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-50" />
                            <div>
                              <p className="text-lg font-medium text-muted-foreground">Заказов пока нет</p>
                              <p className="text-sm text-muted-foreground">Заказы появятся здесь после оформления клиентами</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <TelegramSettings />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}