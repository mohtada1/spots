"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-food-md">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-food-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-poppins font-bold text-gray-800">Spots</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="relative text-gray-700 hover:text-food-primary transition-colors duration-200 py-2 border-b-2 border-food-primary">
              Home
            </Link>
            <Link href="/search" className="relative text-gray-700 hover:text-food-primary transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-food-primary">
              Restaurants
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-food-primary transition-colors px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-food-primary transition-colors px-4 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Restaurants
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
