import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import axios from "axios"
import { useAlert } from "./AlertContext"

interface userType { 
    user_id: number
    name: string
    email: string
    latitude: number
    longitude: number
    created_at: string
}

interface userContextType{
    user: userType | null
    setUser: (user: userType | null) => void
    isLoading: Boolean
}

const AuthContext = createContext< userContextType | null >(null)

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<userType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { setAlert } = useAlert()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/v1/users/me", { withCredentials: true });
                setUser(res.data.data);
            } catch (error: any) {
                setAlert({ message: error.response.data?.detail || "Failed to fetch user data", severity: "error" });
                setUser(null)
            } finally{
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [])

    return(
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)!