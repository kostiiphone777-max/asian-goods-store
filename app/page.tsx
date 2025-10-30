import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/api-integrated/categories"
import { FeaturedProducts } from "@/components/api-integrated/featured-products"
import { About } from "@/components/about"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <About />
      <Newsletter />
      <Footer />
    </main>
  )
}
