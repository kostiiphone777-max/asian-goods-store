"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/hooks/use-api"
import { api } from "@/lib/api"
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  name: string
  image: string
  description?: string
  slug?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
    email?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: string
  notes: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { 
        label: 'Ожидает обработки', 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      }
    case 'processing':
      return { 
        label: 'В обработке', 
        icon: Package, 
        color: 'bg-blue-100 text-blue-800 border-blue-200' 
      }
    case 'shipped':
      return { 
        label: 'Отправлен', 
        icon: Truck, 
        color: 'bg-purple-100 text-purple-800 border-purple-200' 
      }
    case 'delivered':
      return { 
        label: 'Доставлен', 
        icon: CheckCircle, 
        color: 'bg-green-100 text-green-800 border-green-200' 
      }
    case 'cancelled':
      return { 
        label: 'Отменен', 
        icon: XCircle, 
        color: 'bg-red-100 text-red-800 border-red-200' 
      }
    default:
      return { 
        label: status, 
        icon: AlertCircle, 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
  }
}

const getPaymentStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { 
        label: 'Ожидает оплаты', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
      }
    case 'paid':
      return { 
        label: 'Оплачен', 
        color: 'bg-green-100 text-green-800 border-green-200' 
      }
    case 'failed':
      return { 
        label: 'Ошибка оплаты', 
        color: 'bg-red-100 text-red-800 border-red-200' 
      }
    case 'refunded':
      return { 
        label: 'Возвращен', 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
    default:
      return { 
        label: status, 
        color: 'bg-gray-100 text-gray-800 border-gray-200' 
      }
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const orderId = params?.id as string

  useEffect(() => {
    // Ждем загрузки пользователя
    if (userLoading) {
      return
    }

    // Если пользователь не авторизован или не админ
    if (!user || user.role !== 'admin') {
      router.push('/admin')
      return
    }

    if (!orderId) {
      setError('ID заказа не указан')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const orderData = await api.getOrder(orderId)
        setOrder(orderData)
      } catch (err: any) {
        console.error('Ошибка загрузки заказа:', err)
        setError(err.message || 'Ошибка загрузки заказа')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, user, userLoading, router])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return

    setUpdatingStatus(true)
    try {
      await api.updateOrderStatus(order.id, newStatus)
      // Обновляем локальное состояние
      setOrder(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err: any) {
      console.error('Ошибка обновления статуса:', err)
      alert('Ошибка обновления статуса заказа: ' + (err.message || 'Неизвестная ошибка'))
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Показываем загрузку пока пользователь не загружен
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загружаем...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Если пользователь не авторизован, показываем null (перенаправление уже произошло)
  if (!user || user.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загружаем заказ...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Ошибка: {error}</p>
              <Button asChild>
                <Link href="/admin">Вернуться в админ-панель</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Заказ не найден</p>
              <Button asChild>
                <Link href="/admin">Вернуться в админ-панель</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок и навигация */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Вернуться в админ-панель
              </Link>
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                  Заказ #{order.orderNumber}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Оформлен {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex flex-col sm:items-end gap-2">
                <Badge className={`${statusInfo.color} border`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className={paymentStatusInfo.color}>
                  {paymentStatusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная информация */}
            <div className="lg:col-span-2 space-y-6">
              {/* Информация о клиенте */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Информация о клиенте
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Контактная информация</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
                      </div>
                      {order.shippingAddress.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.shippingAddress.phone}</span>
                        </div>
                      )}
                      {order.shippingAddress.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{order.shippingAddress.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Адрес доставки</h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Товары в заказе */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Товары в заказе
                </h2>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1">
                                {item.slug ? (
                                  <Link 
                                    href={`/product/${item.slug}`}
                                    className="hover:text-primary transition-colors"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.name}
                                    <ExternalLink className="h-3 w-3 inline ml-1" />
                                  </Link>
                                ) : (
                                  item.name
                                )}
                              </h3>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} шт. × {item.price.toLocaleString()} ₽
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-lg">
                                {(item.price * item.quantity).toLocaleString()} ₽
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Способ оплаты */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Способ оплаты
                </h2>
                
                <div className="space-y-2">
                  <p className="font-medium">
                    {order.paymentMethod === 'card' && 'Банковская карта'}
                    {order.paymentMethod === 'cash' && 'Наличными при получении'}
                    {order.paymentMethod === 'transfer' && 'Банковский перевод'}
                    {order.paymentMethod === 'bank-transfer' && 'Банковский перевод'}
                  </p>
                  <Badge variant="outline" className={paymentStatusInfo.color}>
                    {paymentStatusInfo.label}
                  </Badge>
                </div>
              </Card>

              {/* Комментарий к заказу */}
              {order.notes && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Комментарий к заказу</h2>
                  <p className="text-muted-foreground">{order.notes}</p>
                </Card>
              )}

              {/* Информация о доставке */}
              {order.trackingNumber && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Отслеживание доставки
                  </h2>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Номер отслеживания: {order.trackingNumber}</p>
                    {order.shippedAt && (
                      <p className="text-sm text-muted-foreground">
                        Отправлен: {new Date(order.shippedAt).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                    {order.deliveredAt && (
                      <p className="text-sm text-muted-foreground">
                        Доставлен: {new Date(order.deliveredAt).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Боковая панель с итогами и действиями */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Итоги заказа</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Товары ({order.items.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                    <span>{order.subtotal.toLocaleString()} ₽</span>
                  </div>
                  
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Доставка</span>
                      <span>{order.shippingCost.toLocaleString()} ₽</span>
                    </div>
                  )}
                  
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span>НДС (20%)</span>
                      <span>{order.tax.toLocaleString()} ₽</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Итого</span>
                    <span>{order.total.toLocaleString()} ₽</span>
                  </div>
                </div>
              </Card>

              {/* Информация о заказе */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Информация о заказе
                </h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Номер заказа:</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Дата оформления:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Последнее обновление:</span>
                    <span className="font-medium">
                      {new Date(order.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Управление статусом */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Управление статусом</h2>
                
                <div className="space-y-3">
                  {order.status === 'pending' && (
                    <Button
                      onClick={() => handleUpdateStatus('processing')}
                      className="w-full"
                      disabled={updatingStatus}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Взять в обработку
                    </Button>
                  )}
                  
                  {order.status === 'processing' && (
                    <Button
                      onClick={() => handleUpdateStatus('shipped')}
                      className="w-full"
                      disabled={updatingStatus}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Отправить
                    </Button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button
                      onClick={() => handleUpdateStatus('delivered')}
                      className="w-full"
                      disabled={updatingStatus}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Отметить как доставленный
                    </Button>
                  )}
                  
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUpdateStatus('cancelled')}
                      className="w-full"
                      disabled={updatingStatus}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Отменить заказ
                    </Button>
                  )}
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/admin">Вернуться к списку заказов</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
