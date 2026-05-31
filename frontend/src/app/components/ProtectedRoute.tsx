import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Loader from "./loader/loader"
import { JSX, ReactNode, useEffect } from "react"

export const ProtectedRoute = ({ children }: { children: ReactNode }): JSX.Element => {
    const { user, isLoading, isLoggingOut, setIsLoggingOut } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoading) return;
        if (!user && !isLoggingOut) {
            navigate("/login");
        } else if (!user && isLoggingOut) {
            navigate("/");
        }
    }, [isLoading, user, isLoggingOut, navigate]);

    if (isLoading) return <Loader />
    if (!user) return <></>

    return <>{children}</>
}