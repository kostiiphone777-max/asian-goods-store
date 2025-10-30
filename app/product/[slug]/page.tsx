"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useProductBySlug } from "@/hooks/use-api"
import { useCart } from "@/contexts/cart-context"
import { useState, useEffect } from "react"

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('')
  const { product, loading, error } = useProductBySlug(slug)
  const { addToCart, loading: cartLoading } = useCart()

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug))
  }, [params])

  const handleAddToCart = async () => {
    if (product && product.isActive && product.stock > 0) {
      try {
        await addToCart(product.id, 1)
      } catch (error) {
        console.error('Ошибка добавления в корзину:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Загружаем товар…</h1>
          <p className="text-muted-foreground">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  const rating = Math.max(0, Math.min(5, Math.round(product.rating || 0)))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад к каталогу
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-card">
              {product.badge && (
                <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">{product.badge}</Badge>
              )}
              <Image
                src={(product.images && product.images[0]) || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex flex-col">
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < rating ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating?.toFixed(1) ?? 0} ({product.reviewCount ?? 0} отзывов)
                </span>
              </div>

              <div className="mb-6">
                <span className="font-serif text-4xl font-bold text-foreground">{product.price} ₽</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-3 text-muted-foreground line-through">{product.originalPrice} ₽</span>
                )}
              </div>

              <div className="mb-6">
                {product.isActive && product.stock > 0 ? (
                  <span className="text-green-600 font-medium">В наличии ({product.stock} шт.)</span>
                ) : (
                  <span className="text-red-600 font-medium">Нет в наличии</span>
                )}
              </div>

              {product.description && (
              <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>
              )}

              <div className="flex gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.isActive || product.stock <= 0 || cartLoading}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {cartLoading ? "Добавляем..." : "Добавить в корзину"}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Вес/Объем:</span>
                    <span className="font-medium">{product.weight}</span>
                  </div>
                )}
                {product.country && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Страна:</span>
                    <span className="font-medium">{product.country}</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mb-16">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-6">Описание</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
