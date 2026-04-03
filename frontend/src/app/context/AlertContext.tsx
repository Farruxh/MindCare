import { createContext, useContext, ReactNode, useState} from "react"

interface AlertType{
    message: string,
    severity: "success" | "info" | "error" | "warning"
}

interface AlertContextType{
    alert: AlertType | null,
    setAlert: (alert: AlertType | null) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<AlertType | null>(null)

    return(
        <AlertContext.Provider value={{alert, setAlert}}>
            {children}    
        </AlertContext.Provider>
    )
}

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlert must be used within AlertProvider");
    }
    return context;
}