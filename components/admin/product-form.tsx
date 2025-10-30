"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCategories } from "@/hooks/use-api"
import { Loader2, X, Plus } from "lucide-react"

interface ProductFormProps {
  product?: any
  onSave: (productData: any) => void
  onCancel: () => void
  loading?: boolean
}

export function ProductForm({ product, onSave, onCancel, loading = false }: ProductFormProps) {
  const { categories } = useCategories()
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    categoryId: product?.categoryId || "",
    images: product?.images || [""],
    badge: product?.badge || "",
    stock: product?.stock || 0,
    isActive: product?.isActive !== undefined ? product.isActive : true,
    tags: product?.tags || [""],
    weight: product?.weight || "",
    dimensions: product?.dimensions || "",
    country: product?.country || "",
    rating: product?.rating || 0,
    reviewCount: product?.reviewCount || 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Название обязательно"
    if (!formData.description.trim()) newErrors.description = "Описание обязательно"
    if (!formData.price || formData.price <= 0) newErrors.price = "Цена должна быть больше 0"
    if (!formData.categoryId) newErrors.categoryId = "Выберите категорию"
    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = "Старая цена должна быть больше новой"
    }
    if (formData.stock < 0) newErrors.stock = "Количество не может быть отрицательным"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const productData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      rating: Number(formData.rating),
      reviewCount: Number(formData.reviewCount),
      images: formData.images.filter(img => img.trim()),
      tags: formData.tags.filter(tag => tag.trim())
    }

    onSave(productData)
  }

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ""]
    }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Редактировать товар" : "Добавить товар"}</CardTitle>
        <CardDescription>
          {product ? "Внесите изменения в информацию о товаре" : "Заполните информацию о новом товаре"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основная информация */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название товара *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название товара"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Введите описание товара"
                  rows={4}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="categoryId">Категория *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
              </div>
            </div>

            {/* Цены и остатки */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="originalPrice">Старая цена (₽)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="0.00"
                />
                {errors.originalPrice && <p className="text-sm text-red-500 mt-1">{errors.originalPrice}</p>}
              </div>

              <div>
                <Label htmlFor="stock">Количество на складе</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
                {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
              </div>

              <div>
                <Label htmlFor="badge">Бейдж</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Хит продаж, Новинка, Скидка"
                />
              </div>
            </div>
          </div>

          {/* Изображения */}
          <div>
            <Label>Изображения</Label>
            <div className="space-y-2 mt-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder={`URL изображения ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeImage(index)}
                    disabled={formData.images.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addImage} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить изображение
              </Button>
            </div>
          </div>

          {/* Теги */}
          <div>
            <Label>Теги</Label>
            <div className="space-y-2 mt-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder={`Тег ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeTag(index)}
                    disabled={formData.tags.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTag} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Добавить тег
              </Button>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Вес</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="500г"
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Размеры</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="20x15x10 см"
              />
            </div>
            <div>
              <Label htmlFor="country">Страна</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Япония"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {product ? "Сохранить изменения" : "Добавить товар"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

