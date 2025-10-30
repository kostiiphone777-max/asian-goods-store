"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck, Clock, MapPin, Package, Shield } from "lucide-react"
import Link from "next/link"

export default function DeliveryPage() {
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
              <h1 className="font-serif text-4xl font-bold text-foreground mb-6">Доставка</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Быстрая и надежная доставка азиатских товаров по всей России
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-card rounded-lg">
                <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Курьерская доставка</h3>
                <p className="text-muted-foreground text-sm mb-4">Доставка до двери в Москве и СПб</p>
                <div className="text-2xl font-bold text-primary">500 ₽</div>
                <div className="text-sm text-muted-foreground">1-2 дня</div>
              </div>

              <div className="text-center p-6 bg-card rounded-lg">
                <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Почта России</h3>
                <p className="text-muted-foreground text-sm mb-4">Доставка по всей России</p>
                <div className="text-2xl font-bold text-primary">300 ₽</div>
                <div className="text-sm text-muted-foreground">5-10 дней</div>
              </div>

              <div className="text-center p-6 bg-card rounded-lg">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Пункт выдачи</h3>
                <p className="text-muted-foreground text-sm mb-4">Самовывоз из пунктов выдачи</p>
                <div className="text-2xl font-bold text-primary">200 ₽</div>
                <div className="text-sm text-muted-foreground">3-5 дней</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Условия доставки</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Время работы</h3>
                      <p className="text-muted-foreground text-sm">Доставка работает с 9:00 до 21:00, включая выходные</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Безопасность</h3>
                      <p className="text-muted-foreground text-sm">Все товары упаковываются с особой осторожностью</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Упаковка</h3>
                      <p className="text-muted-foreground text-sm">Экологичная упаковка с фирменным дизайном</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Зоны доставки</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span className="font-medium text-foreground">Москва и область</span>
                    <span className="text-primary font-semibold">1-2 дня</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span className="font-medium text-foreground">Санкт-Петербург</span>
                    <span className="text-primary font-semibold">2-3 дня</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span className="font-medium text-foreground">Центральная Россия</span>
                    <span className="text-primary font-semibold">3-5 дней</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded">
                    <span className="font-medium text-foreground">Дальний Восток</span>
                    <span className="text-primary font-semibold">7-10 дней</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-8 mb-16">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6 text-center">Бесплатная доставка</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-4">от 3 000 ₽</div>
                <p className="text-muted-foreground mb-6">
                  При заказе на сумму от 3 000 рублей доставка по Москве и СПб бесплатная!
                </p>
                <Link href="/">
                  <Button size="lg">Сделать заказ</Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Остались вопросы?</h2>
              <p className="text-muted-foreground mb-8">
                Наша служба поддержки готова ответить на все ваши вопросы о доставке
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/info/contacts">
                  <Button size="lg">Связаться с нами</Button>
                </Link>
                <Link href="/checkout">
                  <Button size="lg" variant="outline">Оформить заказ</Button>
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

