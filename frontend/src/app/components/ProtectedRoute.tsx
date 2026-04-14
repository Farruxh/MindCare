import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Loader from "./loader/loader"
import { JSX, ReactNode, useEffect } from "react"

export const ProtectedRoute = ({ children }: { children: ReactNode }): JSX.Element => {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/login");
        }
    }, [isLoading, user, navigate]);

    if (isLoading) return <Loader />
    if (!user) return <></>

    return <>{children}</>
}