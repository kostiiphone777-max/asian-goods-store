"use client"

import { Cart } from "@/components/api-integrated/cart"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Cart />
      </main>
      <Footer />
    </div>
  )
}

