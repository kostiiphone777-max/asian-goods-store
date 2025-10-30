"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/api-integrated/product-card"
import { useProducts } from "@/hooks/use-api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CatalogPage() {
  const [page, setPage] = useState(1)
  const { products, loading, error, pagination } = useProducts({
    page,
    limit: 12, // Показываем больше товаров на странице каталога
  })

  console.log('CatalogPage render:', { products, loading, error, pagination })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    // Прокручиваем к началу списка товаров
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Навигация */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на главную
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Каталог товаров
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Все товары из нашего ассортимента
            </p>
          </div>
        </div>

        {/* Загрузка */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Загружаем товары...</p>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Ошибка загрузки товаров: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </div>
        )}

        {/* Товары */}
        {!loading && !error && products && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images[0] || "/placeholder.svg"}
                  badge={product.badge}
                  description={product.description}
                  stock={product.stock}
                  isActive={product.isActive}
                />
              ))}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mb-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Предыдущая
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Страница {page} из {pagination.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Следующая
                </Button>
              </div>
            )}

            {/* Информация о количестве товаров */}
            {pagination && (
              <div className="text-center text-sm text-muted-foreground">
                Показано {products.length} из {pagination.totalItems} товаров
              </div>
            )}
          </>
        )}

        {/* Пустой каталог */}
        {!loading && !error && products && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Товары не найдены</p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
