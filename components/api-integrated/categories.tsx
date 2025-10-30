"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useCategories } from "@/hooks/use-api"

export function Categories() {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <section id="categories" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Наши категории
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Загружаем категории...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="categories" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Наши категории
            </h2>
            <p className="text-red-500">Ошибка загрузки категорий: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Наши категории
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Широкий ассортимент товаров для вашего дома и красоты
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="group overflow-hidden border-border hover:border-accent transition-all duration-300 cursor-pointer">
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


