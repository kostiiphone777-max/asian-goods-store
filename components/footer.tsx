import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-4">東方</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Аутентичные азиатские товары для вашего дома и красоты
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/products" className="hover:text-foreground transition-colors">
                  Продукты питания
                </Link>
              </li>
              <li>
                <Link href="/category/cosmetics" className="hover:text-foreground transition-colors">
                  Косметика
                </Link>
              </li>
              <li>
                <Link href="/category/tableware" className="hover:text-foreground transition-colors">
                  Посуда
                </Link>
              </li>
              <li>
                <Link href="/category/decor" className="hover:text-foreground transition-colors">
                  Декор
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Информация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/info/about" className="hover:text-foreground transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/info/delivery" className="hover:text-foreground transition-colors">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/info/payment" className="hover:text-foreground transition-colors">
                  Оплата
                </Link>
              </li>
              <li>
                <Link href="/info/contacts" className="hover:text-foreground transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@eastern-bazaar.ru</li>
              <li>Телефон: +7 (495) 123-45-67</li>
              <li>Москва, ул. Примерная, 123</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Восточный Базар. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
