"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Logo } from "./logo"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  onClick?: () => void
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
  activeItem?: string
  onItemClick?: (item: NavItem) => void
  showSignIn?: boolean
  onSignInClick?: () => void
}

export function TubelightNavBar({ items, className, activeItem, onItemClick, showSignIn = false, onSignInClick }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(activeItem || items[0]?.name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (activeItem) {
      setActiveTab(activeItem)
    }
  }, [activeItem])

  // Scroll tracking to update active tab
  useEffect(() => {
    const handleScroll = () => {
      const sections = items
        .filter(item => item.url.startsWith('#'))
        .map(item => ({
          id: item.url.substring(1),
          name: item.name,
          element: document.getElementById(item.url.substring(1))
        }))
        .filter(section => section.element)

      if (sections.length === 0) return

      const scrollPosition = window.scrollY + 150 // Offset for navbar
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Check if we're at the bottom of the page
      if (scrollPosition + windowHeight >= documentHeight - 100) {
        const lastSection = sections[sections.length - 1]
        setActiveTab(lastSection.name)
        return
      }

      // Find which section is currently in view
      // Check from bottom to top to handle overlapping sections
      let currentSection = sections[0] // Default to first section
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (!section.element) continue
        
        const rect = section.element.getBoundingClientRect()
        const sectionTop = rect.top + window.scrollY
        
        // If we've scrolled past the top of this section, it's the active one
        if (window.scrollY >= sectionTop - 200) {
          currentSection = section
          break
        }
      }

      setActiveTab(currentSection.name)
    }

    // Use throttle to improve performance
    let ticking = false
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollListener, { passive: true })
    // Run once on mount and after delays to ensure DOM is ready
    handleScroll()
    setTimeout(handleScroll, 100)
    setTimeout(handleScroll, 500)
    
    return () => window.removeEventListener('scroll', scrollListener)
  }, [items])

  const handleClick = (item: NavItem) => {
    setActiveTab(item.name)
    if (item.onClick) {
      item.onClick()
    }
    if (onItemClick) {
      onItemClick(item)
    }
    
    // Handle anchor links with offset for navbar
    if (item.url.startsWith('#')) {
      const element = document.getElementById(item.url.substring(1))
      if (element) {
        const offset = 100 // Navbar height + buffer
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <>
      {/* Logo - Fixed top left */}
      <div className="fixed top-6 left-6 z-50">
        <a 
          href="#platform" 
          onClick={(e) => {
            e.preventDefault();
            const element = document.getElementById('platform');
            if (element) {
              const offset = 100;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - offset;
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
          }}
          className="cursor-pointer"
        >
          <Logo />
        </a>
      </div>

      {/* Navigation Bar - Fixed center */}
      <div
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6",
          className,
        )}
      >
        <div className="flex items-center gap-2 bg-background/80 border border-border backdrop-blur-lg py-1.5 px-1.5 rounded-full shadow-lg">
          {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300",
                "text-foreground/80 hover:text-primary hover:scale-105",
                isActive && "bg-muted text-primary scale-105",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-9 h-1 bg-primary rounded-t-full shadow-md shadow-primary/50">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-9 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
        </div>
      </div>
    </>
  )
}

