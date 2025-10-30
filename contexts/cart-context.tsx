"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'

interface CartItem {
  id: string
  productId: string
  quantity: number
  name: string
  price: number
  image: string
  product?: {
    stock: number
  }
}

interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

interface CartContextType {
  cart: Cart
  loading: boolean
  error: string | null
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartItem: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalPrice: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getCart()
      setCart(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки корзины')
    } finally {
      setLoading(false)
    }
  }, [])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    setLoading(true)
    setError(null)
    try {
      await api.addToCart(productId, quantity)
      await fetchCart() // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления в корзину')
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const updateCartItem = useCallback(async (productId: string, quantity: number) => {
    setLoading(true)
    setError(null)
    try {
      await api.updateCartItem(productId, quantity)
      await fetchCart() // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления корзины')
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const removeFromCart = useCallback(async (productId: string) => {
    setLoading(true)
    setError(null)
    try {
      await api.removeFromCart(productId)
      await fetchCart() // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления из корзины')
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await api.clearCart()
      await fetchCart() // Обновляем корзину
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка очистки корзины')
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  // Загружаем корзину при монтировании компонента
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetchCart: fetchCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

