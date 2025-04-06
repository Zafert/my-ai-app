import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    console.log('🚀 Middleware running for path:', request.nextUrl.pathname)
    
    // Allow the callback route to process without middleware
    if (request.nextUrl.pathname === '/auth/callback') {
      console.log('⏭️ Skipping middleware for callback route')
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('🔑 Session state:', {
      exists: !!session,
      user: session?.user?.email,
      error: error?.message
    })

    // Auth page handling
    if (request.nextUrl.pathname === '/signin') {
      if (session) {
        console.log('✅ Has session, redirecting to home from signin')
        return NextResponse.redirect('http://localhost:3000/home')
      }
      console.log('⚠️ No session, staying on signin')
      return res
    }

    // Protect all other pages
    if (!session) {
      console.log('❌ No session, redirecting to signin')
      return NextResponse.redirect('http://localhost:3000/signin')
    }

    console.log('✅ Has session, allowing access to:', request.nextUrl.pathname)
    return res
  } catch (error) {
    console.error('🔥 Middleware error:', error)
    return NextResponse.redirect('http://localhost:3000/signin')
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 