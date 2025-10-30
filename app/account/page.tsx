"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OrderDetailsModal } from "@/components/order-details-modal"
import { useUser, useOrders } from "@/hooks/use-api"
import { Settings, Eye } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
  const { user, loading: userLoading, error: userError, logout } = useUser()
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isLoading = userLoading || ordersLoading

  const handleViewOrder = (orderId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedOrderId(orderId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrderId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-8">Личный кабинет</h1>

          {isLoading && (
            <p className="text-muted-foreground">Загружаем ваш профиль…</p>
          )}

          {userError && (
            <p className="text-red-500 mb-6">Ошибка загрузки профиля: {userError}</p>
          )}

          {!isLoading && !user && (
            <Card className="p-6 mb-12">
              <h2 className="text-xl font-semibold mb-2">Вы не авторизованы</h2>
              <p className="text-muted-foreground mb-4">Войдите, чтобы просматривать профиль и заказы.</p>
              <div className="flex gap-4">
                <Link href="/">
                  <Button>На главную</Button>
                </Link>
              </div>
            </Card>
          )}

          {user && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 lg:col-span-1">
                <h2 className="text-xl font-semibold mb-4">Профиль</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Имя:</span><span className="font-medium">{user.firstName} {user.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-medium">{user.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Роль:</span><span className="font-medium">{user.role}</span></div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" onClick={logout} className="w-full">Выйти</Button>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block">
                      <Button className="w-full gap-2 hover:bg-primary/90 transition-colors">
                        <Settings className="h-4 w-4" />
                        Админ-панель
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Мои заказы</h2>
                {ordersError && <p className="text-red-500">Ошибка загрузки заказов: {ordersError}</p>}
                {!ordersError && orders.length === 0 && (
                  <p className="text-muted-foreground">Заказов пока нет.</p>
                )}
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <Link href={`/account/orders/${order.id}`} className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-medium">Заказ #{order.orderNumber}</div>
                            <div className="text-sm text-muted-foreground">Статус: {order.status}</div>
                            <div className="text-sm text-muted-foreground">Итого: {order.total.toLocaleString()} ₽</div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewOrder(order.id, e)}
                          className="flex-shrink-0"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Просмотр
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}


        </div>
      </main>

      <Footer />

      {/* Модальное окно для просмотра заказа */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}



