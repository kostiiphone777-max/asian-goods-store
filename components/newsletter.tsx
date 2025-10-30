import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">Подпишитесь на рассылку</h2>
          <p className="text-primary-foreground/80 mb-8 leading-relaxed">
            Получайте эксклюзивные предложения, новости о новинках и советы по использованию азиатских товаров
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Ваш email"
              className="bg-primary-foreground text-foreground border-0 flex-1"
            />
            <Button type="submit" variant="secondary" className="whitespace-nowrap">
              Подписаться
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
