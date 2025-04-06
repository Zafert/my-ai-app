import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searches = await prisma.weatherSearch.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    return NextResponse.json(searches)
  } catch (error) {
    console.error('Failed to fetch searches:', error)
    return NextResponse.json({ error: 'Failed to fetch searches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { city } = await request.json()

    const search = await prisma.weatherSearch.create({
      data: {
        city,
        userId: session.user.id
      }
    })

    return NextResponse.json(search)
  } catch (error) {
    console.error('Failed to create search:', error)
    return NextResponse.json({ error: 'Failed to create search' }, { status: 500 })
  }
} 