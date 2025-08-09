import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Dynamic import to avoid SSR issues
    const setupAuthListener = async () => {
      try {
        const { auth } = await import('~/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')

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

        // Return cleanup function
        return unsubscribe
      } catch (error) {
        console.error('Failed to setup auth listener:', error)
        // Fallback to auth page if Firebase fails
        navigate('/auth')
      }
    }

    let unsubscribe: (() => void) | undefined

    setupAuthListener().then((cleanup) => {
      unsubscribe = cleanup
    })

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
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
