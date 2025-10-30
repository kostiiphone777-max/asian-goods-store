"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, CreditCard } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

interface OrderSuccessPageProps {
  params: {
    orderNumber: string
  }
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = params

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Иконка успеха */}
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h1>
          
          {/* Номер заказа */}
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5 text-accent" />
                <span className="text-lg font-semibold">Номер заказа:</span>
              </div>
              <p className="text-2xl font-bold text-accent">{orderNumber}</p>
              <p className="text-muted-foreground">
                Мы отправили подтверждение на вашу электронную почту
              </p>
            </div>
          </Card>

          {/* Что дальше */}
          <Card className="p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold mb-4">Что дальше?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Подтверждение заказа</h3>
                  <p className="text-sm text-muted-foreground">
                    Мы обработаем ваш заказ в течение 1-2 часов
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-accent">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Подготовка к отправке</h3>
                  <p className="text-sm text-muted-foreground">
                    Товары будут упакованы и подготовлены к отправке
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <Truck className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium">Доставка</h3>
                  <p className="text-sm text-muted-foreground">
                    Курьер доставит заказ по указанному адресу
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/account">Мои заказы</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Продолжить покупки</Link>
            </Button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Если у вас есть вопросы по заказу, свяжитесь с нами по телефону{" "}
              <a href="tel:+74951234567" className="text-accent hover:underline">
                +7 (495) 123-45-67
              </a>{" "}
              или напишите на{" "}
              <a href="mailto:info@eastern-bazaar.ru" className="text-accent hover:underline">
                info@eastern-bazaar.ru
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

