"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { api, Product as ApiProduct } from "@/lib/api"

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>("")
  const [category, setCategory] = useState<{ id: string; name: string; description: string } | null>(null)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug))
  }, [params])

  useEffect(() => {
    if (!slug) return
    let isCancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cat = await api.getCategoryBySlug(slug)
        if (isCancelled) return
        setCategory({ id: cat.id, name: cat.name, description: cat.description })

        const res = await api.getProducts({ categoryId: cat.id, limit: 100, sortBy: "rating", sortOrder: "desc" })
        if (isCancelled) return
        setProducts(res.products || [])
      } catch (e: any) {
        if (isCancelled) return
        setError(e?.message || "Ошибка загрузки категории")
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    load()
    return () => {
      isCancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Загружаем категорию…</h1>
          <p className="text-muted-foreground">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Категория не найдена</h1>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/#categories">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Назад к категориям
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">{category.name}</h1>
            {category.description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{category.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                image={(p.images && p.images[0]) || "/placeholder.svg"}
                badge={p.badge}
                description={p.description}
                stock={p.stock}
                isActive={p.isActive}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
