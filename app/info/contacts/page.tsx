"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function ContactsPage() {
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
              <h1 className="font-serif text-4xl font-bold text-foreground mb-6">Контакты</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Свяжитесь с нами любым удобным способом
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Телефон</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Основной номер</p>
                    <a href="tel:+74951234567" className="text-foreground font-semibold hover:text-primary transition-colors">
                      +7 (495) 123-45-67
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Мобильный</p>
                    <a href="tel:+79161234567" className="text-foreground font-semibold hover:text-primary transition-colors">
                      +7 (916) 123-45-67
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">WhatsApp</p>
                    <a href="https://wa.me/79161234567" className="text-foreground font-semibold hover:text-primary transition-colors">
                      +7 (916) 123-45-67
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Email</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Общие вопросы</p>
                    <a href="mailto:info@eastern-bazaar.ru" className="text-foreground font-semibold hover:text-primary transition-colors">
                      info@eastern-bazaar.ru
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Поддержка</p>
                    <a href="mailto:support@eastern-bazaar.ru" className="text-foreground font-semibold hover:text-primary transition-colors">
                      support@eastern-bazaar.ru
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Партнерство</p>
                    <a href="mailto:partners@eastern-bazaar.ru" className="text-foreground font-semibold hover:text-primary transition-colors">
                      partners@eastern-bazaar.ru
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Адрес</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-foreground font-semibold">Офис и склад</p>
                  <p className="text-muted-foreground">
                    Москва, ул. Примерная, д. 123<br />
                    БЦ "Восточный", офис 456
                  </p>
                  <p className="text-muted-foreground text-sm mt-4">
                    Ближайшее метро: Сокольники (5 мин пешком)
                  </p>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-lg">Время работы</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Пн-Пт</span>
                    <span className="text-foreground font-semibold">9:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сб-Вс</span>
                    <span className="text-foreground font-semibold">10:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="text-foreground font-semibold">9:00 - 21:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-8 mb-16">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6 text-center">Свяжитесь с нами</h2>
              <div className="max-w-2xl mx-auto">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Имя *
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ваше имя"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Тема *
                    </label>
                    <select
                      id="subject"
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Выберите тему</option>
                      <option value="order">Вопрос по заказу</option>
                      <option value="delivery">Доставка</option>
                      <option value="payment">Оплата</option>
                      <option value="return">Возврат</option>
                      <option value="partnership">Партнерство</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Сообщение *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Опишите ваш вопрос или предложение..."
                      required
                    />
                  </div>
                  <div className="text-center">
                    <Button size="lg" className="w-full md:w-auto">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Отправить сообщение
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Как добраться</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">На метро</h3>
                    <p className="text-muted-foreground text-sm">
                      Станция "Сокольники", выход №2. Идти прямо 300 метров, повернуть направо на ул. Примерная.
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">На автомобиле</h3>
                    <p className="text-muted-foreground text-sm">
                      Парковка во дворе БЦ "Восточный". Въезд с ул. Примерная, дом 123.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Социальные сети</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Facebook</p>
                      <p className="text-muted-foreground text-sm">@easternbazaar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">ig</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Instagram</p>
                      <p className="text-muted-foreground text-sm">@eastern_bazaar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">tg</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Telegram</p>
                      <p className="text-muted-foreground text-sm">@eastern_bazaar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Готовы помочь!</h2>
              <p className="text-muted-foreground mb-8">
                Наша команда всегда готова ответить на ваши вопросы и помочь с выбором товаров
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button size="lg">Перейти к каталогу</Button>
                </Link>
                <a href="tel:+74951234567">
                  <Button size="lg" variant="outline">Позвонить сейчас</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

