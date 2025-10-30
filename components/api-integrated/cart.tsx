"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useUser } from "@/hooks/use-api"
import Link from "next/link"
import Image from "next/image"

interface CartProps {
  onClose?: () => void
}

export function Cart({ onClose }: CartProps) {
  const { user } = useUser()
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setIsUpdating(productId)
    try {
      await updateCartItem(productId, newQuantity)
    } catch (error) {
      console.error('Ошибка обновления количества:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(productId)
    try {
      await removeFromCart(productId)
    } catch (error) {
      console.error('Ошибка удаления товара:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleClearCart = async () => {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
      try {
        await clearCart()
      } catch (error) {
        console.error('Ошибка очистки корзины:', error)
      }
    }
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-4"></div>
        <p className="text-muted-foreground">Загружаем корзину...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Ошибка загрузки корзины: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Корзина пуста
        </h3>
        <p className="text-muted-foreground text-center mb-6">
          Добавьте товары в корзину, чтобы продолжить покупки
        </p>
        <Button asChild>
          <Link href="/">Перейти к товарам</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Корзина ({cart.totalItems} товаров)
        </h2>
        {cart.items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить
          </Button>
        )}
      </div>

      {/* Список товаров */}
      <div className="space-y-4">
        {cart.items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              {/* Изображение товара */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>

              {/* Информация о товаре */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.price} ₽ за шт.
                </p>
                
                {/* Наличие */}
                {item.product && (
                  <div className="flex items-center gap-2 mb-3">
                    {item.product.stock > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        В наличии ({item.product.stock} шт.)
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Нет в наличии
                      </Badge>
                    )}
                  </div>
                )}

                {/* Управление количеством */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={isUpdating === item.productId || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        if (!isNaN(value) && value >= 0) {
                          handleQuantityChange(item.productId, value)
                        }
                      }}
                      className="w-16 text-center"
                      min="0"
                      disabled={isUpdating === item.productId}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={
                        isUpdating === item.productId || 
                        (item.product && item.quantity >= item.product.stock)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {(item.price * item.quantity).toLocaleString()} ₽
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isUpdating === item.productId}
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Итого */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Товары ({cart.totalItems} шт.)</span>
            <span>{cart.totalPrice.toLocaleString()} ₽</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Итого</span>
              <span>{cart.totalPrice.toLocaleString()} ₽</span>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-6 space-y-3">
          {user ? (
            <Button asChild className="w-full">
              <Link href="/checkout">Оформить заказ</Link>
            </Button>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth">Войти для оформления</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth">Создать аккаунт</Link>
              </Button>
            </div>
          )}
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Продолжить покупки</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}


