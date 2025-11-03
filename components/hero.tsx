import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/traditional-asian-tea-ceremony-minimalist.jpg"
          alt="Traditional Asian Tea Ceremony"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
          Откройте для себя
          <br />
          <span className="italic">Восточную культуру</span>
        </h2>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Аутентичные товары из Азии: от традиционной посуды до изысканной косметики и деликатесов
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="group">
            <Link href="/#products">
              Смотреть каталог
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/info/about">
              Узнать больше
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
