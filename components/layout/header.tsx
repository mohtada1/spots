"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const menuJustOpenedRef = useRef(false)
  
  // Check if we're on the homepage (which has the hero section)
  const isHomepage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Close mobile menu on scroll
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
      
      setScrollY(currentScrollY)
      
      if (isHomepage) {
        // Homepage behavior with hero section
        const heroHeight = window.innerHeight
        
        if (currentScrollY > heroHeight) {
          // Past hero section - implement hide/show on scroll direction
          if (currentScrollY > lastScrollY && currentScrollY > heroHeight + 100) {
            // Scrolling down past hero + buffer - hide header
            setIsVisible(false)
          } else if (currentScrollY < lastScrollY) {
            // Scrolling up - show header
            setIsVisible(true)
          }
        } else {
          // Within hero section - always show header
          setIsVisible(true)
        }
      } else {
        // Other pages behavior - simpler hide/show logic
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down past threshold - hide header
          setIsVisible(false)
        } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
          // Scrolling up or near top - show header
          setIsVisible(true)
        }
      }
      
      setLastScrollY(currentScrollY)
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobileMenuOpen])

  // Close mobile menu on any interaction outside the menu
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      // Ignore the click that just opened the menu
      if (menuJustOpenedRef.current) {
        menuJustOpenedRef.current = false
        return
      }

      const target = event.target as Element
      // Don't close if clicking on the menu button or menu itself
      if (target.closest('[data-mobile-menu]') || target.closest('[data-mobile-menu-button]')) {
        return
      }
      setIsMobileMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Close on Escape key
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    // Add event listeners immediately
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  // Calculate styling based on page type and scroll position
  let backgroundOpacity = 1 // Default to solid for non-homepage
  
  if (isHomepage) {
    // Homepage: gradual transition based on hero section
    const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
    const scrollProgress = Math.min(scrollY / (heroHeight * 0.3), 1) // 30% of hero height for transition
    backgroundOpacity = scrollProgress
  } else {
    // Other pages: solid header always, but can be hidden/shown
    backgroundOpacity = 1
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${backgroundOpacity > 0.1 ? 'backdrop-blur-md' : ''}`}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
        borderBottomColor: `rgba(229, 231, 235, ${backgroundOpacity})`,
        borderBottomWidth: backgroundOpacity > 0.1 ? '1px' : '0px',
        boxShadow: backgroundOpacity > 0.5 ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none'
      }}>
      <div className="container mx-auto px-food-md">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-food-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span 
              className="text-2xl font-poppins font-bold transition-colors duration-500"
              style={{
                color: isHomepage 
                  ? `rgb(${255 - (224 * backgroundOpacity)}, ${255 - (214 * backgroundOpacity)}, ${255 - (200 * backgroundOpacity)})` // Homepage: white to gray
                  : '#1f2937' // Other pages: always dark gray
              }}
            >Spots</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="relative hover:text-food-primary transition-colors duration-500 py-2 border-b-2 border-food-primary"
              style={{
                color: isHomepage 
                  ? `rgb(${255 - (198 * backgroundOpacity)}, ${255 - (190 * backgroundOpacity)}, ${255 - (174 * backgroundOpacity)})` // Homepage: white to gray
                  : '#374151' // Other pages: always gray-700
              }}
            >
              Home
            </Link>
            <Link 
              href="/search" 
              className="relative hover:text-food-primary transition-colors duration-500 py-2 border-b-2 border-transparent hover:border-food-primary"
              style={{
                color: isHomepage 
                  ? `rgb(${255 - (198 * backgroundOpacity)}, ${255 - (190 * backgroundOpacity)}, ${255 - (174 * backgroundOpacity)})` // Homepage: white to gray
                  : '#374151' // Other pages: always gray-700
              }}
            >
              Restaurants
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">

            {/* Mobile Menu Button */}
            <button
              data-mobile-menu-button
              className={`md:hidden rounded-full p-2 transition-all duration-500 focus:outline-none ${
                isMobileMenuOpen ? 'rotate-90' : 'rotate-0'
              }`}
              style={{
                color: isHomepage 
                  ? `rgb(${255 - (198 * backgroundOpacity)}, ${255 - (190 * backgroundOpacity)}, ${255 - (174 * backgroundOpacity)})` // Homepage: white to gray
                  : '#374151', // Other pages: always gray-700
                backgroundColor: isHomepage 
                  ? (backgroundOpacity < 0.5 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') // Subtle background based on context
                  : 'rgba(0, 0, 0, 0.05)' // Light background for other pages
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                if (isHomepage && backgroundOpacity < 0.5) {
                  target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                } else {
                  target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                if (isHomepage && backgroundOpacity < 0.5) {
                  target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                } else {
                  target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                }
              }}
              onFocus={(e) => {
                const target = e.target as HTMLButtonElement
                if (isHomepage && backgroundOpacity < 0.5) {
                  target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
                } else {
                  target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
                }
              }}
              onBlur={(e) => {
                const target = e.target as HTMLButtonElement
                if (isHomepage && backgroundOpacity < 0.5) {
                  target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                } else {
                  target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                }
              }}
              onClick={() => {
                if (!isMobileMenuOpen) {
                  menuJustOpenedRef.current = true
                }
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 ease-in-out" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300 ease-in-out" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay - positioned below header */}
            <div 
              className="md:hidden fixed bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
              style={{
                top: '64px', // Height of header (h-16 = 64px)
                left: 0,
                right: 0,
                bottom: 0
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu content */}
            <div 
              data-mobile-menu
              className="md:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-t shadow-xl z-50 animate-in slide-in-from-top-2 duration-300 ease-out"
              style={{
                backgroundColor: isHomepage 
                  ? (backgroundOpacity > 0.1 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(0, 0, 0, 0.8)')
                  : 'rgba(255, 255, 255, 0.98)', // Always white on other pages
                borderTopColor: isHomepage 
                  ? (backgroundOpacity > 0.1 ? 'rgba(229, 231, 235, 0.5)' : 'rgba(255, 255, 255, 0.2)')
                  : 'rgba(229, 231, 235, 0.5)' // Always gray border on other pages
              }}
            >
              <nav className="flex flex-col py-2">
                <Link
                  href="/"
                  className="px-6 py-4 hover:text-food-primary transition-all duration-200 border-b font-medium"
                  style={{
                    color: isHomepage 
                      ? (backgroundOpacity > 0.1 ? '#374151' : '#ffffff') // Homepage: dynamic
                      : '#374151', // Other pages: always dark
                    borderBottomColor: isHomepage 
                      ? (backgroundOpacity > 0.1 ? 'rgba(243, 244, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)')
                      : 'rgba(243, 244, 246, 0.5)' // Other pages: always gray border
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="px-6 py-4 hover:text-food-primary transition-all duration-200 font-medium"
                  style={{
                    color: isHomepage 
                      ? (backgroundOpacity > 0.1 ? '#374151' : '#ffffff') // Homepage: dynamic
                      : '#374151' // Other pages: always dark
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Restaurants
                </Link>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
