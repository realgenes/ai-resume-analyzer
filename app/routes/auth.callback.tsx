import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppStore } from '~/lib/store'
import { supabase } from '~/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { checkAuthStatus } = useAppStore()

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from URL fragments
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/auth?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Check auth status to sync with our store
          await checkAuthStatus()
          navigate('/')
        } else {
          navigate('/auth')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    // Small delay to ensure URL fragments are processed
    const timeoutId = setTimeout(handleAuthCallback, 100)
    
    return () => clearTimeout(timeoutId)
  }, [navigate, checkAuthStatus])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
}
