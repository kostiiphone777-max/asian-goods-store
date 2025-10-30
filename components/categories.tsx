import { Card } from "@/components/ui/card"
import Link from "next/link"

const categories = [
  {
    title: "Продукты",
    description: "Соусы, специи, лапша",
    image: "/asian-food-products-soy-sauce-noodles.jpg",
    slug: "products",
  },
  {
    title: "Косметика",
    description: "K-beauty и J-beauty",
    image: "/korean-japanese-beauty-skincare-products.jpg",
    slug: "cosmetics",
  },
  {
    title: "Посуда",
    description: "Чайные наборы, палочки",
    image: "/asian-tea-set-ceramic-bowls.jpg",
    slug: "tableware",
  },
  {
    title: "Декор",
    description: "Статуэтки, веера, фонари",
    image: "/asian-home-decor-lanterns-fans.jpg",
    slug: "decor",
  },
]

export function Categories() {
  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">Наши категории</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Широкий ассортимент товаров для вашего дома и красоты
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={`/category/${category.slug}`}>
              <Card className="group overflow-hidden border-border hover:border-accent transition-all duration-300 cursor-pointer">
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
