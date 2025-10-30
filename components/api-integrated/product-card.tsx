"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-api"
import { useState } from "react"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  badge?: string | null
  description?: string
  slug: string
  stock?: number
  isActive?: boolean
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  badge,
  description,
  slug,
  stock = 0,
  isActive = true
}: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isActive || stock <= 0) return
    
    setIsAdding(true)
    try {
      await addToCart(id, 1)
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const isOutOfStock = !isActive || stock <= 0
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300">
      <Link href={`/product/${slug}`}>
        <div className="relative aspect-square overflow-hidden bg-card cursor-pointer">
          {/* Бейдж */}
          {badge && (
            <div className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
              {badge}
            </div>
          )}

          {/* Скидка */}
          {discount > 0 && (
            <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              -{discount}%
            </div>
          )}

          {/* Кнопка избранного */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-foreground hover:fill-accent hover:text-accent'
              }`} 
            />
          </button>

          {/* Изображение товара */}
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Наложение для товаров не в наличии */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
                {!isActive ? 'Недоступен' : 'Нет в наличии'}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/product/${slug}`}>
          <h3 className="font-medium text-lg text-foreground mb-2 text-pretty line-clamp-2 hover:text-accent transition-colors cursor-pointer">
            {name}
          </h3>
        </Link>

        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Цена */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-serif text-xl font-bold text-foreground">
            {price.toLocaleString()} ₽
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString()} ₽
            </span>
          )}
        </div>

        {/* Наличие */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {isOutOfStock ? (
              <span className="text-red-500">Нет в наличии</span>
            ) : (
              <span className="text-green-600">В наличии ({stock} шт.)</span>
            )}
          </div>
        </div>

        {/* Кнопка добавления в корзину */}
        <Button
          size="sm"
          variant="outline"
          className="w-full group/btn bg-transparent"
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
          )}
          {isAdding ? 'Добавляем...' : isOutOfStock ? 'Недоступен' : 'В корзину'}
        </Button>
      </div>
    </Card>
  )
}


