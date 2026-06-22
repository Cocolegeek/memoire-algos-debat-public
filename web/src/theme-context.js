import { createContext, useContext } from 'react'

export const ThemeContext = createContext(null)

export function themeInitial() {
  if (typeof window === 'undefined') return false
  const stocke = window.localStorage.getItem('theme')
  if (stocke) return stocke === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useTheme() {
  return useContext(ThemeContext)
}
