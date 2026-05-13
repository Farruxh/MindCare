import { useEffect, ReactNode } from "react"
import { useAuth } from "../context/AuthContext"

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth()
    
    useEffect(() => {
        if (user && user.dark_mode === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }        
    }, [user?.dark_mode])

    return <>{children}</>
}