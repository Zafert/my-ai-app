'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import styles from './signin.module.css'
import { useState } from 'react'

export default function SignIn() {
  const supabase = createClientComponentClient()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

    } catch (error) {
      console.error('Error during sign in:', error)
      setError('The authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.signInBox}>
        <h1>Welcome</h1>
        <button
          className={styles.signInButton}
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Sign in with GitHub'}
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  )
} 