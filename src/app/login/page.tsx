import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
// import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { useAuthStore } from "@/store/auth"
import ciudadImage from "./ciudad.jpg"

export default function LoginPage() {
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/dashboard")
    }
  }, [token, navigate])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img
              src="/logo-color.png"
              alt="Municipalidad de Rivadavia"
              className="h-16 dark:hidden"
            />
            <img
              src="/logo-white.png"
              alt="Municipalidad de Rivadavia"
              className="hidden h-16 dark:inline"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src={ciudadImage}
          alt="Ciudad"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
