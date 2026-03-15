import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { Loader2 } from 'lucide-react'

const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
     if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
                <Loader2 className="animate-spin text-[#31b8c6]" size={40} />
            </div>
        )
    }
    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected