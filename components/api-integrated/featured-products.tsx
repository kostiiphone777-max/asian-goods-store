"use client"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useProducts } from "@/hooks/use-api"
import { useState } from "react"
import Link from "next/link"

export function FeaturedProducts() {
  const [page, setPage] = useState(1)
  const { products, loading, error, pagination } = useProducts({
    page,
    limit: 6,
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  console.log('FeaturedProducts render:', { products, loading, error, pagination })

  if (loading) {
    return (
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Популярные товары
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Загружаем лучшие товары...
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Популярные товары
            </h2>
            <p className="text-red-500 mb-4">Ошибка загрузки товаров: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="products" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Популярные товары
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Тщательно отобранные товары высочайшего качества
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((product) => {
            try {
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images?.[0] || "/placeholder.svg"}
                  badge={product.badge}
                  description={product.description}
                  stock={product.stock}
                  isActive={product.isActive}
                />
              )
            } catch (error) {
              console.error('Error rendering ProductCard:', error, product)
              return (
                <div key={product.id} className="p-4 border border-red-500 rounded">
                  <p>Ошибка отображения товара: {product.name}</p>
                  <p className="text-sm text-gray-500">{error.message}</p>
                </div>
              )
            }
          })}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Предыдущая
            </Button>
            <span className="flex items-center px-4">
              Страница {page} из {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              Следующая
            </Button>
          </div>
        )}

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/catalog">
              Смотреть все товары
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
