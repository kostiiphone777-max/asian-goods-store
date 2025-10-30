"use client"

import { ShoppingCart, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { useUser } from "@/hooks/use-api"
import { useCart } from "@/contexts/cart-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useUser()
  const { cart } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">東方</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Главная
            </Link>
            <Link
              href="/#categories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Категории
            </Link>
            <Link
              href="/#products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Товары
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              О нас
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href={user ? "/account" : "/auth"}>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                {user ? 'Кабинет' : 'Вход'}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Поиск</span>
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                  {cart.totalItems}
                </span>
                <span className="sr-only">Корзина</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Меню</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href={user ? "/account" : "/auth"} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                {user ? 'Кабинет' : 'Вход'}
              </Link>
              <Link href="/" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                Главная
              </Link>
              <Link
                href="/#categories"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Категории
              </Link>
              <Link
                href="/#products"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Товары
              </Link>
              <Link
                href="/#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                О нас
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
