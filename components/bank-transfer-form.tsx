"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Building2, 
  Copy, 
  CheckCircle, 
  Clock, 
  FileText, 
  CreditCard,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface BankTransferFormProps {
  amount: number
  orderNumber: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  onCancel: () => void
}

interface PaymentConfirmation {
  paymentDate: string
  paymentAmount: string
  paymentReference: string
  bankName: string
  additionalInfo: string
  // Реквизиты счета отправителя
  senderAccount: string
  senderBank: string
  senderBik: string
  senderInn: string
  senderName: string
}

export function BankTransferForm({ amount, orderNumber, onSuccess, onError, onCancel }: BankTransferFormProps) {
  const [currentStep, setCurrentStep] = useState<'details' | 'confirmation' | 'processing' | 'success'>('details')
  const [confirmationData, setConfirmationData] = useState<PaymentConfirmation>({
    paymentDate: '',
    paymentAmount: '',
    paymentReference: '',
    bankName: '',
    additionalInfo: '',
    // Реквизиты счета отправителя
    senderAccount: '',
    senderBank: '',
    senderBik: '',
    senderInn: '',
    senderName: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const bankDetails = {
    recipient: "ООО 'Восточный Базар'",
    inn: "1234567890",
    kpp: "123456789",
    account: "40702810123456789012",
    bank: "ПАО 'Сбербанк'",
    bik: "044525225",
    correspondentAccount: "30101810400000000225",
    purpose: `Оплата заказа №${orderNumber}`
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} скопирован в буфер обмена`)
    } catch (err) {
      toast.error('Ошибка копирования')
    }
  }

  const handleConfirmationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      toast.error('Необходимо согласиться с условиями')
      return
    }

    if (!confirmationData.paymentDate || !confirmationData.paymentAmount || !confirmationData.paymentReference) {
      toast.error('Заполните все обязательные поля')
      return
    }

    // Проверяем реквизиты отправителя (необязательные, но если заполнены - должны быть корректными)
    if (confirmationData.senderAccount && confirmationData.senderAccount.length < 20) {
      toast.error('Номер счета отправителя должен содержать не менее 20 цифр')
      return
    }
    if (confirmationData.senderBik && confirmationData.senderBik.length !== 9) {
      toast.error('БИК банка отправителя должен содержать 9 цифр')
      return
    }
    if (confirmationData.senderInn && (confirmationData.senderInn.length !== 10 && confirmationData.senderInn.length !== 12)) {
      toast.error('ИНН отправителя должен содержать 10 или 12 цифр')
      return
    }

    setIsProcessing(true)
    setCurrentStep('processing')

    try {
      // Имитация обработки подтверждения платежа
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentData = {
        transactionId: `BT_${Date.now()}`,
        amount: amount,
        currency: 'RUB',
        status: 'pending_confirmation',
        paymentMethod: 'bank_transfer',
        confirmationData: confirmationData,
        timestamp: new Date().toISOString()
      }
      
      setCurrentStep('success')
      setTimeout(() => {
        onSuccess(paymentData)
      }, 2000)
      
    } catch (error) {
      console.error('Ошибка обработки подтверждения:', error)
      setCurrentStep('details')
      onError('Ошибка обработки подтверждения платежа')
    } finally {
      setIsProcessing(false)
    }
  }

  if (currentStep === 'processing') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mb-6">
          <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Обработка подтверждения</h2>
        <p className="text-muted-foreground">
          Мы обрабатываем ваше подтверждение платежа...
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
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Подтверждение получено!</h2>
        <p className="text-muted-foreground">
          Ваше подтверждение платежа по заказу #{orderNumber} получено. 
          Мы проверим поступление средств в течение 1-2 рабочих дней.
        </p>
      </div>
    )
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">Подтверждение платежа</h2>
          </div>
          <p className="text-muted-foreground">
            Заказ #{orderNumber} • {amount.toLocaleString()} ₽
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleConfirmationSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Важно!</span>
              </div>
              <p className="text-sm text-blue-600">
                После совершения перевода заполните форму ниже для подтверждения платежа. 
                Это поможет нам быстрее обработать ваш заказ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentDate">Дата платежа *</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={confirmationData.paymentDate}
                  onChange={(e) => setConfirmationData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="paymentAmount">Сумма платежа *</Label>
                <Input
                  id="paymentAmount"
                  type="text"
                  placeholder={amount.toLocaleString()}
                  value={confirmationData.paymentAmount}
                  onChange={(e) => setConfirmationData(prev => ({ ...prev, paymentAmount: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentReference">Номер платежа/комментарий *</Label>
              <Input
                id="paymentReference"
                type="text"
                placeholder={`Заказ ${orderNumber}`}
                value={confirmationData.paymentReference}
                onChange={(e) => setConfirmationData(prev => ({ ...prev, paymentReference: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="bankName">Банк отправителя</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="Например: Сбербанк, ВТБ, Альфа-Банк"
                value={confirmationData.bankName}
                onChange={(e) => setConfirmationData(prev => ({ ...prev, bankName: e.target.value }))}
              />
            </div>

            {/* Реквизиты счета отправителя */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Реквизиты счета отправителя (необязательно)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Укажите ваши банковские реквизиты для более точной идентификации платежа
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderName">ФИО отправителя</Label>
                  <Input
                    id="senderName"
                    type="text"
                    placeholder="Иванов Иван Иванович"
                    value={confirmationData.senderName}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, senderName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="senderInn">ИНН отправителя</Label>
                  <Input
                    id="senderInn"
                    type="text"
                    placeholder="1234567890"
                    value={confirmationData.senderInn}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, senderInn: e.target.value.replace(/\D/g, '') }))}
                    maxLength={12}
                  />
                </div>
                
                <div>
                  <Label htmlFor="senderAccount">Номер счета отправителя</Label>
                  <Input
                    id="senderAccount"
                    type="text"
                    placeholder="40702810123456789012"
                    value={confirmationData.senderAccount}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, senderAccount: e.target.value.replace(/\D/g, '') }))}
                    maxLength={20}
                  />
                </div>
                
                <div>
                  <Label htmlFor="senderBank">Банк отправителя (полное название)</Label>
                  <Input
                    id="senderBank"
                    type="text"
                    placeholder="ПАО 'Сбербанк'"
                    value={confirmationData.senderBank}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, senderBank: e.target.value }))}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="senderBik">БИК банка отправителя</Label>
                  <Input
                    id="senderBik"
                    type="text"
                    placeholder="044525225"
                    value={confirmationData.senderBik}
                    onChange={(e) => setConfirmationData(prev => ({ ...prev, senderBik: e.target.value.replace(/\D/g, '') }))}
                    maxLength={9}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Дополнительная информация</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Любая дополнительная информация о платеже..."
                value={confirmationData.additionalInfo}
                onChange={(e) => setConfirmationData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                Я подтверждаю, что совершил банковский перевод на указанную сумму и предоставленные данные корректны
              </Label>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Подтвердить платеж
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('details')}
                className="w-full"
              >
                Вернуться к реквизитам
              </Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-semibold">Оплата банковским переводом</h2>
        </div>
        <p className="text-muted-foreground">
          Заказ #{orderNumber} • {amount.toLocaleString()} ₽
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Реквизиты для перевода */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Реквизиты для перевода</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Получатель</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={bankDetails.recipient} readOnly className="bg-muted" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankDetails.recipient, "Получатель")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ИНН</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={bankDetails.inn} readOnly className="bg-muted" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(bankDetails.inn, "ИНН")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">КПП</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={bankDetails.kpp} readOnly className="bg-muted" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(bankDetails.kpp, "КПП")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Расчетный счет</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={bankDetails.account} readOnly className="bg-muted" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankDetails.account, "Расчетный счет")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Банк получателя</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={bankDetails.bank} readOnly className="bg-muted" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankDetails.bank, "Банк получателя")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">БИК</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={bankDetails.bik} readOnly className="bg-muted" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(bankDetails.bik, "БИК")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Корр. счет</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={bankDetails.correspondentAccount} readOnly className="bg-muted" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(bankDetails.correspondentAccount, "Корреспондентский счет")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Назначение платежа</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={bankDetails.purpose} readOnly className="bg-muted" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(bankDetails.purpose, "Назначение платежа")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Инструкции и информация */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Инструкции по оплате</h3>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p>Скопируйте реквизиты получателя в ваш банк</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p>Совершите перевод на сумму <strong>{amount.toLocaleString()} ₽</strong></p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p>Укажите в назначении платежа: <strong>{bankDetails.purpose}</strong></p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <p>Подтвердите платеж, заполнив форму ниже</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <h3 className="text-xl font-semibold">Важная информация</h3>
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Срок зачисления средств: 1-2 рабочих дня</p>
              <p>• Комиссия банка оплачивается отдельно</p>
              <p>• Обязательно укажите назначение платежа</p>
              <p>• Сохраните квитанцию о переводе</p>
              <p>• После перевода подтвердите платеж</p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Итоговая сумма</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Сумма заказа:</span>
                <span>{amount.toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Комиссия банка:</span>
                <span>По тарифам банка</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>К переводу:</span>
                  <span>{amount.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          onClick={() => setCurrentStep('confirmation')}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Я совершил перевод, подтвердить платеж
        </Button>
        
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full"
        >
          Отменить заказ
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Если у вас возникли вопросы по оплате, свяжитесь с нами по телефону{" "}
          <a href="tel:+74951234567" className="text-primary hover:underline">+7 (495) 123-45-67</a>
        </p>
      </div>
    </div>
  )
}
