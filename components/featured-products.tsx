import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

const products = [
  {
    id: 1,
    slug: "1-набор-для-чайной-церемонии",
    name: "Набор для чайной церемонии",
    description: "Традиционный керамический набор из Японии",
    price: 4500,
    image: "/japanese-tea-ceremony-set-ceramic.jpg",
    badge: "Хит продаж",
  },
  {
    id: 7,
    slug: "7-корейская-тканевая-маска",
    name: "Корейская тканевая маска",
    description: "Увлажняющая маска с гиалуроновой кислотой",
    price: 350,
    image: "/korean-sheet-face-mask.jpg",
    badge: "Новинка",
  },
  {
    id: 1,
    slug: "1-соевый-соус-premium",
    name: "Соевый соус премиум",
    description: "Натуральный соевый соус из Японии",
    price: 890,
    image: "/premium-japanese-soy-sauce-bottle.jpg",
    badge: null,
  },
  {
    id: 22,
    slug: "22-бамбуковое-растение",
    name: "Бамбуковое растение",
    description: "Счастливый бамбук в декоративной вазе",
    price: 1200,
    image: "/lucky-bamboo-plant-vase.jpg",
    badge: null,
  },
  {
    id: 2,
    slug: "2-рисовая-лапша",
    name: "Рисовая лапша",
    description: "Традиционная вьетнамская лапша",
    price: 280,
    image: "/vietnamese-rice-noodles-package.jpg",
    badge: null,
  },
  {
    id: 21,
    slug: "21-веер-настенный",
    name: "Веер настенный",
    description: "Декоративный веер с традиционной росписью",
    price: 1800,
    image: "/decorative-wall-fan-asian.jpg",
    badge: "Эксклюзив",
  },
]

export function FeaturedProducts() {
  return (
    <section id="products" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">Популярные товары</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Тщательно отобранные товары высочайшего качества
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              id={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              image={product.image}
              badge={product.badge}
              description={product.description}
              onAddToCart={() => console.log(`Добавлен в корзину: ${product.name}`)}
              onToggleFavorite={() => console.log(`Добавлен в избранное: ${product.name}`)}
            />
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline">
            Смотреть все товары
          </Button>
        </div>
      </div>
    </section>
  )
}
