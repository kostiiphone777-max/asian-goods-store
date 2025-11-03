export function About() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
              Путешествие в мир восточной культуры
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Мы тщательно отбираем каждый товар, работая напрямую с производителями из Японии, Кореи, Китая и других
                азиатских стран. Наша миссия — сделать аутентичные восточные товары доступными для всех ценителей
                азиатской культуры.
              </p>
              <p>
                От традиционной керамики ручной работы до современной косметики K-beauty — каждый продукт в нашем
                каталоге отражает богатое наследие и инновации Востока.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-accent mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Товаров</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-accent mb-1">15</div>
                <div className="text-sm text-muted-foreground">Стран</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-accent mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Клиентов</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-secondary">
              <img 
                src="/asian-store-interior-traditional-products.jpg" 
                alt="О нас" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
