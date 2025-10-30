"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/contexts/cart-context"
import { useUser } from "@/hooks/use-api"
import { api } from "@/lib/api"
import { Loader2, CreditCard, Truck, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { PaymentForm } from "@/components/payment-form"
import { BankTransferForm } from "@/components/bank-transfer-form"

export function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const { user } = useUser()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showBankTransferForm, setShowBankTransferForm] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const [formData, setFormData] = useState({
    // Адрес доставки
    shippingStreet: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "Россия",
    
    // Способ оплаты
    paymentMethod: "card",
    
    // Дополнительная информация
    notes: "",
    
    // Использовать тот же адрес для выставления счета
    sameBillingAddress: true,
    
    // Адрес выставления счета (если отличается)
    billingStreet: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "Россия"
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError("Для оформления заказа необходимо войти в систему")
      return
    }

    if (cart.items.length === 0) {
      setError("Корзина пуста")
      return
    }

    // Проверяем заполненность обязательных полей
    if (!formData.shippingStreet || !formData.shippingCity || !formData.shippingPostalCode) {
      setError("Заполните все обязательные поля адреса доставки")
      return
    }

    setError(null)

    // Подготавливаем данные заказа
    const orderData = {
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        street: formData.shippingStreet,
        city: formData.shippingCity,
        postalCode: formData.shippingPostalCode,
        country: formData.shippingCountry
      },
      billingAddress: formData.sameBillingAddress ? {
        street: formData.shippingStreet,
        city: formData.shippingCity,
        postalCode: formData.shippingPostalCode,
        country: formData.shippingCountry
      } : {
        street: formData.billingStreet,
        city: formData.billingCity,
        postalCode: formData.billingPostalCode,
        country: formData.billingCountry
      },
      paymentMethod: formData.paymentMethod,
      notes: formData.notes
    }

    // Если выбран способ оплаты картой, показываем форму оплаты
    if (formData.paymentMethod === "card") {
      setOrderData(orderData)
      setShowPaymentForm(true)
      return
    }

    // Если выбран банковский перевод, показываем форму перевода
    if (formData.paymentMethod === "transfer") {
      setOrderData(orderData)
      setShowBankTransferForm(true)
      return
    }

    // Для других способов оплаты создаем заказ сразу
    await createOrder(orderData)
  }

  const createOrder = async (orderData: any) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Создаем заказ
      const order = await api.createOrder(orderData)
      
      // Очищаем корзину
      await clearCart()
      
      // Перенаправляем на страницу успешного оформления
      router.push(`/order-success/${order.orderNumber}`)
      
    } catch (err: any) {
      console.error('Ошибка оформления заказа:', err)
      setError(err.message || "Произошла ошибка при оформлении заказа")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // Создаем заказ с данными об оплате
      const orderWithPayment = {
        ...orderData,
        paymentData: paymentData,
        paymentStatus: 'paid'
      }
      
      await createOrder(orderWithPayment)
    } catch (err: any) {
      console.error('Ошибка создания заказа после оплаты:', err)
      setError(err.message || "Ошибка создания заказа после оплаты")
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
    setShowPaymentForm(false)
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setOrderData(null)
  }

  const handleBankTransferSuccess = async (paymentData: any) => {
    try {
      // Создаем заказ с данными о банковском переводе
      const orderWithPayment = {
        ...orderData,
        paymentData: paymentData,
        paymentStatus: 'pending_confirmation'
      }
      
      await createOrder(orderWithPayment)
    } catch (err: any) {
      console.error('Ошибка создания заказа после банковского перевода:', err)
      setError(err.message || "Ошибка создания заказа после банковского перевода")
    }
  }

  const handleBankTransferError = (error: string) => {
    setError(error)
    setShowBankTransferForm(false)
  }

  const handleBankTransferCancel = () => {
    setShowBankTransferForm(false)
    setOrderData(null)
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Необходима авторизация</h2>
        <p className="text-muted-foreground mb-6">
          Для оформления заказа необходимо войти в систему
        </p>
        <Button asChild>
          <a href="/auth">Войти в систему</a>
        </Button>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Корзина пуста</h2>
        <p className="text-muted-foreground mb-6">
          Добавьте товары в корзину для оформления заказа
        </p>
        <Button asChild>
          <a href="/">Перейти к товарам</a>
        </Button>
      </div>
    )
  }

  // Если показываем форму оплаты
  if (showPaymentForm && orderData) {
    const totalAmount = cart.totalPrice + 500 + Math.round(cart.totalPrice * 0.2)
    return (
      <PaymentForm
        amount={totalAmount}
        orderNumber={`TEMP_${Date.now()}`}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
    )
  }

  // Если показываем форму банковского перевода
  if (showBankTransferForm && orderData) {
    const totalAmount = cart.totalPrice + 500 + Math.round(cart.totalPrice * 0.2)
    return (
      <BankTransferForm
        amount={totalAmount}
        orderNumber={`TEMP_${Date.now()}`}
        onSuccess={handleBankTransferSuccess}
        onError={handleBankTransferError}
        onCancel={handleBankTransferCancel}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Оформление заказа</h1>
        <p className="text-muted-foreground">
          Завершите оформление заказа, указав данные для доставки
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Форма */}
        <div className="space-y-6">
          {/* Адрес доставки */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Адрес доставки</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="shippingStreet">Улица и дом *</Label>
                <Input
                  id="shippingStreet"
                  value={formData.shippingStreet}
                  onChange={(e) => handleInputChange("shippingStreet", e.target.value)}
                  placeholder="ул. Примерная, д. 1, кв. 10"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippingCity">Город *</Label>
                  <Input
                    id="shippingCity"
                    value={formData.shippingCity}
                    onChange={(e) => handleInputChange("shippingCity", e.target.value)}
                    placeholder="Москва"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="shippingPostalCode">Почтовый индекс *</Label>
                  <Input
                    id="shippingPostalCode"
                    value={formData.shippingPostalCode}
                    onChange={(e) => handleInputChange("shippingPostalCode", e.target.value)}
                    placeholder="123456"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shippingCountry">Страна *</Label>
                <Input
                  id="shippingCountry"
                  value={formData.shippingCountry}
                  onChange={(e) => handleInputChange("shippingCountry", e.target.value)}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Способ оплаты */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Способ оплаты</h2>
            </div>
            
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Банковская карта</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Наличными при получении</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer">Банковский перевод</Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Дополнительная информация */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Дополнительная информация</h2>
            </div>
            
            <div>
              <Label htmlFor="notes">Комментарий к заказу</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Укажите особые пожелания по доставке..."
                rows={3}
              />
            </div>
          </Card>
        </div>

        {/* Правая колонка - Итоги заказа */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
            
            {/* Товары */}
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} шт. × {item.price.toLocaleString()} ₽
                    </p>
                  </div>
                  <p className="font-semibold">
                    {(item.price * item.quantity).toLocaleString()} ₽
                  </p>
                </div>
              ))}
            </div>

            {/* Итоги */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Товары ({cart.totalItems} шт.)</span>
                <span>{cart.totalPrice.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Итого</span>
                <span>{cart.totalPrice.toLocaleString()} ₽</span>
              </div>
            </div>
          </Card>

          {/* Кнопка оформления */}
          <Card className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Оформляем заказ...
                </>
              ) : (
                "Оформить заказ"
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Нажимая "Оформить заказ", вы соглашаетесь с условиями использования
            </p>
          </Card>
        </div>
      </form>
    </div>
  )
}
