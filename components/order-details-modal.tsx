"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

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
    street: string
    city: string
    postalCode: string
    country: string
  }
  billingAddress: {
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

interface OrderDetailsModalProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
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

export function OrderDetailsModal({ orderId, isOpen, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrder()
    }
  }, [isOpen, orderId])

  const fetchOrder = async () => {
    if (!orderId) return

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

  const handleCancelOrder = async () => {
    if (!order) return

    const confirmed = window.confirm(
      `Вы уверены, что хотите отменить заказ #${order.orderNumber}?\n\n` +
      'После отмены товары будут возвращены на склад, а заказ нельзя будет восстановить.'
    )

    if (!confirmed) return

    setCancelling(true)
    try {
      await api.cancelOrder(order.id)
      // Обновляем локальное состояние
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null)
      alert('Заказ успешно отменен')
    } catch (err: any) {
      console.error('Ошибка отмены заказа:', err)
      alert('Ошибка отмены заказа: ' + (err.message || 'Неизвестная ошибка'))
    } finally {
      setCancelling(false)
    }
  }

  if (!isOpen) return null

  const statusInfo = order ? getStatusInfo(order.status) : null
  const paymentStatusInfo = order ? getPaymentStatusInfo(order.paymentStatus) : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {order ? `Заказ #${order.orderNumber}` : 'Загрузка...'}
              </h2>
              {order && (
                <p className="text-muted-foreground">
                  Оформлен {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {order && statusInfo && (
                <Badge className={`${statusInfo.color} border`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Загружаем заказ...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Ошибка: {error}</p>
              <Button onClick={onClose}>Закрыть</Button>
            </div>
          )}

          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <div className="lg:col-span-2 space-y-6">
                {/* Товары в заказе */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Товары в заказе
                  </h3>
                  
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium">
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
                              </h4>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.quantity} шт. × {item.price.toLocaleString()} ₽
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold">
                                {(item.price * item.quantity).toLocaleString()} ₽
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Адрес доставки */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Адрес доставки
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </Card>

                {/* Способ оплаты */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Способ оплаты
                  </h3>
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
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-3">Комментарий к заказу</h3>
                    <p className="text-muted-foreground text-sm">{order.notes}</p>
                  </Card>
                )}

                {/* Информация о доставке */}
                {order.trackingNumber && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Отслеживание доставки
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Номер отслеживания: {order.trackingNumber}</p>
                      {order.shippedAt && (
                        <p className="text-muted-foreground">
                          Отправлен: {new Date(order.shippedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                      {order.deliveredAt && (
                        <p className="text-muted-foreground">
                          Доставлен: {new Date(order.deliveredAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Боковая панель с итогами */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3">Итоги заказа</h3>
                  <div className="space-y-2 text-sm">
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

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Информация о заказе
                  </h3>
                  <div className="space-y-2 text-sm">
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

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/account/orders/${order.id}`}>
                        Подробнее
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Закрыть
                    </Button>
                  </div>
                  
                  {order.status === 'pending' && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                    >
                      {cancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Отменяем...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Отменить заказ
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
