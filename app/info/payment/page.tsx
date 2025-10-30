"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад на главную
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-serif text-4xl font-bold text-foreground mb-6">Способы оплаты</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Безопасные и удобные способы оплаты для ваших покупок
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Банковские карты</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата картами Visa, MasterCard, МИР. Безопасные платежи через защищенное соединение.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Мгновенное подтверждение</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">3D Secure защита</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Возврат в течение 14 дней</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Banknote className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Банковский перевод</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата через банковский перевод с подтверждением платежа. Подходит для крупных заказов.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Без комиссии с нашей стороны</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Подтверждение платежа</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Зачисление 1-2 дня</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Электронные кошельки</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата через Яндекс.Деньги, WebMoney, QIWI и другие электронные платежные системы.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Мгновенная оплата</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Удобно для мобильных</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Бонусы и кэшбэк</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Banknote className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Наличными при получении</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата наличными курьеру при доставке. Доступно только для курьерской доставки.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Проверка товара перед оплатой</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Без предоплаты</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Только для Москвы и СПб</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-8 mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="font-serif text-3xl font-bold text-foreground">Безопасность платежей</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Защита данных</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• SSL-шифрование всех платежей</li>
                    <li>• Соответствие стандарту PCI DSS</li>
                    <li>• Данные карт не хранятся на наших серверах</li>
                    <li>• Двухфакторная аутентификация</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Гарантии</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Возврат средств в течение 14 дней</li>
                    <li>• Страхование всех платежей</li>
                    <li>• Поддержка 24/7</li>
                    <li>• Прозрачные условия возврата</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Возврат средств</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Условия возврата</h3>
                    <p className="text-muted-foreground text-sm">
                      Возврат возможен в течение 14 дней с момента получения товара. 
                      Товар должен быть в оригинальной упаковке и не использованным.
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Сроки возврата</h3>
                    <p className="text-muted-foreground text-sm">
                      Средства возвращаются на тот же способ оплаты в течение 3-10 рабочих дней 
                      после получения товара обратно.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Часто задаваемые вопросы</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Можно ли оплатить заказ частично?</h3>
                    <p className="text-muted-foreground text-sm">
                      Да, для крупных заказов возможна рассрочка. Свяжитесь с нами для обсуждения условий.
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Есть ли комиссия за платежи?</h3>
                    <p className="text-muted-foreground text-sm">
                      Мы не взимаем дополнительных комиссий. Комиссия банка оплачивается отдельно.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Готовы сделать заказ?</h2>
              <p className="text-muted-foreground mb-8">
                Выберите удобный способ оплаты и оформите заказ прямо сейчас
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/checkout">
                  <Button size="lg">Оформить заказ</Button>
                </Link>
                <Link href="/info/contacts">
                  <Button size="lg" variant="outline">Задать вопрос</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

