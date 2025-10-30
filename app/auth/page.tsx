"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/account")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            {isLogin ? (
              <LoginForm 
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setIsLogin(false)}
              />
            ) : (
              <RegisterForm 
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setIsLogin(true)}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

