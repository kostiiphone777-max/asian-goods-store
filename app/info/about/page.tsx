"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Globe, Award, Heart } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
              <h1 className="font-serif text-4xl font-bold text-foreground mb-6">О компании</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Мы — мост между Востоком и Западом, приносящий аутентичные азиатские товары прямо к вашим дверям
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Наша миссия</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Сделать аутентичные восточные товары доступными для всех ценителей азиатской культуры. 
                  Мы тщательно отбираем каждый продукт, работая напрямую с производителями из Японии, 
                  Кореи, Китая и других азиатских стран.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  От традиционной керамики ручной работы до современной косметики K-beauty — 
                  каждый продукт в нашем каталоге отражает богатое наследие и инновации Востока.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Наши ценности</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Аутентичность</h3>
                      <p className="text-muted-foreground text-sm">Только оригинальные товары от проверенных производителей</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Качество</h3>
                      <p className="text-muted-foreground text-sm">Тщательный отбор каждого товара по строгим стандартам</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Сервис</h3>
                      <p className="text-muted-foreground text-sm">Индивидуальный подход к каждому клиенту</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Культурный обмен</h3>
                      <p className="text-muted-foreground text-sm">Популяризация восточной культуры в России</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-8 mb-16">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6 text-center">Наша история</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">2019</div>
                  <h3 className="font-semibold text-foreground mb-2">Основание</h3>
                  <p className="text-muted-foreground text-sm">Начали с небольшого ассортимента японского чая и корейской косметики</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">2021</div>
                  <h3 className="font-semibold text-foreground mb-2">Расширение</h3>
                  <p className="text-muted-foreground text-sm">Добавили посуду, декор и продукты питания из 15 азиатских стран</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">2025</div>
                  <h3 className="font-semibold text-foreground mb-2">Сегодня</h3>
                  <p className="text-muted-foreground text-sm">Более 500 товаров и 10,000 довольных клиентов по всей России</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Присоединяйтесь к нам!</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Станьте частью сообщества ценителей восточной культуры. 
                Подписывайтесь на наши новости и получайте эксклюзивные предложения.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button size="lg">Перейти к каталогу</Button>
                </Link>
                <Link href="/info/contacts">
                  <Button size="lg" variant="outline">Связаться с нами</Button>
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

