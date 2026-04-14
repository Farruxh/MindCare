import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Loader from "./loader/loader"
import { JSX, ReactNode } from "react"

export const ProtectedRoute = ({ children }: { children: ReactNode }): JSX.Element => {
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()

    if (isLoading) return <Loader />
    if (!isLoading && !user) return <>{navigate("/login")}</>

    return <>{children}</>
}