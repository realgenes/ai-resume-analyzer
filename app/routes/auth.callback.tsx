import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { auth } from '~/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        navigate('/')
      } else {
        // User is signed out
        navigate('/auth')
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
}
