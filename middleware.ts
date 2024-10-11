import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log(request.nextUrl);

  const res =  NextResponse.next();
  
  res.headers.append('ACCESS-CONTROL-ALLOW-ORIGIN', '*')

  return res;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/:path*', '/api/auth/:path*' ],
}