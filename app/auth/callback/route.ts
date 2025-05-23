import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      })
      
      await supabase.auth.exchangeCodeForSession(code)
      
      // Redirect to home page
      return NextResponse.redirect('http://localhost:3000/home')
    }

    return NextResponse.redirect('http://localhost:3000/signin')
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect('http://localhost:3000/signin')
  }
} 