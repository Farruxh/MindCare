import { useState, useEffect, createContext, useContext, ReactNode } from "react"

interface DarkModeType {
    isDarkMode: boolean
    setIsDarkMode: (isDarkMode: boolean) => void
}

const ThemeContext = createContext<DarkModeType | null>(null)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode") ?? "false")
})

    useEffect(() => {
    if(isDarkMode) {
        document.documentElement.classList.add("dark")
    } else {
        document.documentElement.classList.remove("dark")
    }
}, [isDarkMode])

    return (
        <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)!