import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import {router} from "../app/app.routes"
import { useAuth } from '../features/auth/hook/useAuth'

const App = () => {
     const auth = useAuth()

  useEffect(() => {
    auth.handleGetMe()
  }, [])

  return (
    <div className='w-full h-screen bg-zinc-900 text-white'>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
