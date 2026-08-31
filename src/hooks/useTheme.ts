import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('social-fund-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('social-fund-theme', theme)
    window.dispatchEvent(new CustomEvent('social-fund:theme', { detail: theme }))
  }, [theme])

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail
      if (nextTheme === 'light' || nextTheme === 'dark') setTheme(nextTheme)
    }
    window.addEventListener('social-fund:theme', syncTheme)
    return () => window.removeEventListener('social-fund:theme', syncTheme)
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
  }
}
