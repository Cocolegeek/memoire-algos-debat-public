import { useEffect, useMemo, useState } from 'react'
import { ThemeContext, themeInitial } from './theme-context.js'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(themeInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    window.localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const value = useMemo(() => ({ dark, toggle: () => setDark((d) => !d) }), [dark])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
