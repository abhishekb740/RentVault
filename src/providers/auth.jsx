import { AuthContext } from "../context/auth";
import { useState } from "react";

export default function AuthProvider({ children }) {
    const [auth, setAuth] = useState()

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}