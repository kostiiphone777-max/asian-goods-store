"use client"

import { CheckoutForm } from "@/components/checkout-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutForm />
      </main>
      <Footer />
    </div>
  )
}

