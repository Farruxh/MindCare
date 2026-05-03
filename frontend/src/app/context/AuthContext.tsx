import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import axios from "axios"
import { useAlert } from "./AlertContext"

interface userType {
    user_id: number
    name: string
    email: string
    isDarkMode: "light" | "dark"
    latitude: number
    longitude: number
    email_notifications: boolean
    created_at: string
}

interface userContextType {
    user: userType | null
    setUser: (user: userType | null) => void
    isLoading: boolean
}

const AuthContext = createContext<userContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<userType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { setAlert } = useAlert()
    let isRefreshing = false

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/v1/users/me", { withCredentials: true });
                setUser(res.data.data);
            } catch (error: any) {
                if (error.response?.status === 401 && !isRefreshing) {
                    isRefreshing = true
                    try {
                        await axios.post("/api/v1/users/refresh-token", {}, { withCredentials: true });

                        const retryRes = await axios.get("/api/v1/users/me", { withCredentials: true });
                        setUser(retryRes.data.data);
                        return;
                    } catch (refreshError) {
                        setUser(null);
                    } finally {
                        isRefreshing = false
                    }
                } else {
                    setUser(null);
                }
            } finally {
                setIsLoading(false)
            }
        }
        if (localStorage.getItem("isLoggedIn")) {
            fetchUser()
        }
        else {
            setIsLoading(false)
        }

        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401 && !error.config._retry && !isRefreshing) {
                    error.config._retry = true;
                    isRefreshing = true
                    try {
                        await axios.post("/api/v1/users/refresh-token", {}, { withCredentials: true });
                        return axios(error.config);
                    } catch (e) {
                        setAlert({ message: "Session expired. Please log in again.", severity: "error" });
                        setUser(null);
                        return Promise.reject(e);
                    } finally {
                        isRefreshing = false
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)!