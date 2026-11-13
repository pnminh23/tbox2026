// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Mã bí mật dùng để verify JWT
const secret = new TextEncoder().encode('$2a$07$mCrmhu15cZYTIgEItLgVJ.UV12wi/kgyOmhEzQpGvwMTjIbpqv4Nm');

/**
 * Middleware chạy cho mọi request (trừ static assets)
 */
export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Danh sách các route công khai không cần login
    const publicPaths = [
        '/',
        '/bookRoom',
        /^\/bookRoom\/[^/]+$/,
        '/listFilm',
        '/locations',
        '/news',
        /^\/news\/[^/]+$/,
        '/combo',
        '/auth/login',
        '/auth/register',
        '/auth/forgotPassword',
    ];

    // Bỏ qua nếu là public hoặc asset
    if (
        publicPaths.some((p) => (p instanceof RegExp ? p.test(pathname) : p === pathname)) ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/public/') ||
        pathname.match(/\.(.*)$/)
    ) {
        return NextResponse.next();
    }

    // Lấy token từ cookie
    const token = req.cookies.get('token')?.value;
    
    // Nếu không có cookie token, cho phép pass (sẽ check bằng localStorage ở client-side)
    // Điều này cần thiết cho Vercel deployment với token trong localStorage
    if (!token) {
        // Nếu là admin route, vẫn cho qua (client-side protection sẽ handle)
        if (pathname.startsWith('/admin')) {
            return NextResponse.next();
        }
        // Các route khác cần login → redirect
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Verify và decode JWT
    let payload;
    try {
        const { payload: pl } = await jwtVerify(token, secret);
        payload = pl;
    } catch (err) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    const role = payload.role || 'user';

    // Nếu là user mà truy cập /admin → trả về 404
    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.rewrite(new URL('/404', req.url));
    }

    // Cho phép qua các route hợp lệ
    return NextResponse.next();
}
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
    runtime: 'nodejs',
};
