"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Lock, Shield, CheckCircle, XCircle } from "lucide-react"
import { Loader2 } from "lucide-react"

interface PaymentFormProps {
  amount: number
  orderNumber: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

interface CardData {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

export function PaymentForm({ amount, orderNumber, onSuccess, onError, onCancel }: PaymentFormProps) {
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: ""
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<CardData>>({})
  const [currentStep, setCurrentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')

  const formatCardNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '')
    // Добавляем пробелы каждые 4 цифры
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    // Простая проверка Luhn алгоритма
    let sum = 0
    let isEven = false
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0 && cleaned.length >= 13 && cleaned.length <= 19
  }

  const validateForm = () => {
    const newErrors: Partial<CardData> = {}
    
    if (!cardData.number || !validateCardNumber(cardData.number)) {
      newErrors.number = "Введите корректный номер карты"
    }
    
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiryMonth = "Выберите срок действия карты"
    } else {
      const currentDate = new Date()
      const expiryDate = new Date(parseInt(cardData.expiryYear), parseInt(cardData.expiryMonth) - 1)
      
      if (expiryDate <= currentDate) {
        newErrors.expiryMonth = "Срок действия карты истек"
      }
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = "Введите корректный CVV код"
    }
    
    if (!cardData.cardholderName || cardData.cardholderName.length < 2) {
      newErrors.cardholderName = "Введите имя держателя карты"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CardData, value: string) => {
    if (field === 'number') {
      value = formatCardNumber(value)
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4)
    } else if (field === 'cardholderName') {
      value = value.toUpperCase()
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsProcessing(true)
    setCurrentStep('processing')
    
    try {
      // Имитация обработки платежа
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // В реальном приложении здесь был бы вызов API банка
      const paymentData = {
        transactionId: `TXN_${Date.now()}`,
        amount: amount,
        currency: 'RUB',
        status: 'completed',
        cardLast4: cardData.number.slice(-4),
        timestamp: new Date().toISOString()
      }
      
      setCurrentStep('success')
      setTimeout(() => {
        onSuccess(paymentData)
      }, 2000)
      
    } catch (error) {
      console.error('Ошибка обработки платежа:', error)
      setCurrentStep('error')
      onError('Ошибка обработки платежа. Попробуйте еще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return 'visa'
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard'
    if (cleaned.startsWith('3')) return 'amex'
    return 'unknown'
  }

  const cardType = getCardType(cardData.number)

  if (currentStep === 'processing') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mb-6">
          <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Обработка платежа</h2>
        <p className="text-muted-foreground">
          Пожалуйста, не закрывайте страницу. Мы обрабатываем ваш платеж...
        </p>
      </div>
    )
  }

  if (currentStep === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Платеж успешно обработан!</h2>
        <p className="text-muted-foreground">
          Ваш заказ #{orderNumber} оплачен на сумму {amount.toLocaleString()} ₽
        </p>
      </div>
    )
  }

  if (currentStep === 'error') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mb-6">
          <XCircle className="h-16 w-16 mx-auto text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Ошибка платежа</h2>
        <p className="text-muted-foreground mb-6">
          Не удалось обработать платеж. Попробуйте еще раз или выберите другой способ оплаты.
        </p>
        <div className="space-y-2">
          <Button onClick={() => setCurrentStep('form')} className="w-full">
            Попробовать снова
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Отменить заказ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CreditCard className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-semibold">Оплата картой</h2>
        </div>
        <p className="text-muted-foreground">
          Заказ #{orderNumber} • {amount.toLocaleString()} ₽
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Номер карты */}
          <div>
            <Label htmlFor="cardNumber">Номер карты *</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                value={cardData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`pr-10 ${errors.number ? 'border-red-500' : ''}`}
                maxLength={19}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {cardType === 'visa' && <span className="text-blue-600 font-bold">VISA</span>}
                {cardType === 'mastercard' && <span className="text-red-600 font-bold">MC</span>}
                {cardType === 'amex' && <span className="text-blue-600 font-bold">AMEX</span>}
              </div>
            </div>
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          {/* Срок действия и CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Срок действия *</Label>
              <div className="flex gap-2">
                <Select
                  value={cardData.expiryMonth}
                  onValueChange={(value) => handleInputChange('expiryMonth', value)}
                >
                  <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
                    <SelectValue placeholder="ММ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = String(i + 1).padStart(2, '0')
                      return (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                
                <Select
                  value={cardData.expiryYear}
                  onValueChange={(value) => handleInputChange('expiryYear', value)}
                >
                  <SelectTrigger className={errors.expiryMonth ? 'border-red-500' : ''}>
                    <SelectValue placeholder="ГГ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              {errors.expiryMonth && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryMonth}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                type="text"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                className={errors.cvv ? 'border-red-500' : ''}
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Имя держателя карты */}
          <div>
            <Label htmlFor="cardholderName">Имя держателя карты *</Label>
            <Input
              id="cardholderName"
              type="text"
              value={cardData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              placeholder="IVAN IVANOV"
              className={errors.cardholderName ? 'border-red-500' : ''}
            />
            {errors.cardholderName && (
              <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
            )}
          </div>

          {/* Безопасность */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Безопасная оплата</span>
            </div>
            <p className="text-sm text-green-600">
              Ваши данные защищены 256-битным SSL-шифрованием
            </p>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Оплатить {amount.toLocaleString()} ₽
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Отменить
            </Button>
          </div>
        </form>
      </Card>

      {/* Информация о безопасности */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Мы не сохраняем данные вашей карты. Все платежи обрабатываются через защищенный шлюз.
        </p>
      </div>
    </div>
  )
}

