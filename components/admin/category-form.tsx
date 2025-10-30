"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCategories } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"

interface CategoryFormProps {
  category?: any
  onSave: (categoryData: any) => void
  onCancel: () => void
  loading?: boolean
}

export function CategoryForm({ category, onSave, onCancel, loading = false }: CategoryFormProps) {
  const { categories } = useCategories()
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    image: category?.image || "",
    parentId: category?.parentId || "root",
    isActive: category?.isActive !== undefined ? category.isActive : true,
    sortOrder: category?.sortOrder || 0,
    metaTitle: category?.metaTitle || "",
    metaDescription: category?.metaDescription || ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Название обязательно"
    if (!formData.description.trim()) newErrors.description = "Описание обязательно"
    if (formData.sortOrder < 0) newErrors.sortOrder = "Порядок не может быть отрицательным"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const categoryData: any = {
      ...formData,
      sortOrder: Number(formData.sortOrder),
      metaTitle: formData.metaTitle || formData.name,
      metaDescription: formData.metaDescription || formData.description
    };
    
    // Устанавливаем parentId в null для корневой категории, иначе оставляем как есть
    if (formData.parentId === "root") {
      categoryData.parentId = null;
    } else {
      categoryData.parentId = formData.parentId;
    }

    onSave(categoryData)
  }

  const rootCategories = categories.filter(cat => !cat.parentId)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{category ? "Редактировать категорию" : "Добавить категорию"}</CardTitle>
        <CardDescription>
          {category ? "Внесите изменения в информацию о категории" : "Заполните информацию о новой категории"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название категории *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название категории"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Введите описание категории"
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="image">URL изображения</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="/category-image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="parentId">Родительская категория</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительскую категорию (необязательно)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Корневая категория</SelectItem>
                  {rootCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sortOrder">Порядок сортировки</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                  placeholder="0"
                />
                {errors.sortOrder && <p className="text-sm text-red-500 mt-1">{errors.sortOrder}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Активна</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="metaTitle">SEO заголовок</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Заголовок для поисковых систем"
              />
            </div>

            <div>
              <Label htmlFor="metaDescription">SEO описание</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Описание для поисковых систем"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {category ? "Сохранить изменения" : "Добавить категорию"}
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

