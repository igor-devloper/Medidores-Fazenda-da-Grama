  "use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, BarChart3, Settings } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-10">
      <div className="flex justify-around items-center">
        <Link href="/" className={`flex flex-col items-center ${isActive("/") ? "text-emerald-500" : "text-gray-500"}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </Link>

        <Link
          href="/live"
          className={`flex flex-col items-center ${isActive("/live") ? "text-emerald-500" : "text-gray-500"}`}
        >
          <Activity className="h-5 w-5" />
          <span className="text-xs mt-1">Tempo Real</span>
        </Link>

        <Link
          href="/overview"
          className={`flex flex-col items-center ${isActive("/overview") ? "text-emerald-500" : "text-gray-500"}`}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="text-xs mt-1">Consumo</span>
        </Link>

        <Link
          href="/settings"
          className={`flex flex-col items-center ${isActive("/settings") ? "text-emerald-500" : "text-gray-500"}`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Ajustes</span>
        </Link>
      </div>
    </div>
  )
}
