import { useEffect, ReactNode } from "react"
import { useAuth } from "../context/AuthContext"

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()
    
    useEffect(() => {
        if (user && user.isDarkMode === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }        
    }, [user?.isDarkMode])

    return <>{children}</>
}