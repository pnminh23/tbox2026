import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import logoSrc from '@public/static/img/logoBOX.svg';
import { useUserData } from '@/services/account';
import { PATH } from '@/constants/config';
import { Button } from '@/components/ui';
import AccountBadge from '../AccountBadge';
import style from './Header.module.scss';

const NAV = [
    { path: PATH.BookRoom, label: 'Phòng' },
    { path: PATH.Combo, label: 'Combo' },
    { path: PATH.ListFilm, label: 'Phim' },
    { path: PATH.Locations, label: 'Cơ sở' },
    { path: PATH.News, label: 'Tin tức' },
];

/** overlay: trong suốt khi nằm trên ảnh hero, có nền khi cuộn xuống. */
const Header = ({ overlay = false }) => {
    const router = useRouter();
    const { user, isLoading } = useUserData();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Đóng menu khi chuyển trang
    useEffect(() => setOpen(false), [router.asPath]);

    // Menu mobile: khóa cuộn, Esc để đóng, đưa focus vào menu
    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        drawerRef.current?.querySelector('a, button')?.focus();
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const isActive = (path) => router.pathname === path || router.pathname.startsWith(`${path}/`);
    const links = NAV.map(({ path, label }) => (
        <Link
            key={path}
            href={path}
            className={clsx(style.link, isActive(path) && style.active)}
            aria-current={isActive(path) ? 'page' : undefined}
        >
            {label}
        </Link>
    ));

    const account = isLoading ? null : user ? (
        <AccountBadge user={user} />
    ) : (
        <Link href={PATH.Login} className={style.link}>
            Đăng nhập
        </Link>
    );

    // Menu mobile nằm ngoài <header>: backdrop-filter của header làm lệch position: fixed
    return (
        <>
            <header className={clsx(style.header, overlay && !scrolled && style.transparent)}>
                <div className={style.bar}>
                    <Link href={PATH.Home} className={style.logo} aria-label="PNM BOX, về trang chủ">
                        <Image src={logoSrc} alt="" height={34} priority />
                    </Link>
                    <nav aria-label="Chính" className={style.nav}>
                        {links}
                    </nav>
                    <div className={style.actions}>
                        <div className={style.account}>{account}</div>
                        <Button href={PATH.BookRoom} className={style.cta}>
                            Đặt phòng
                        </Button>
                        <button
                            type="button"
                            className={style.menuBtn}
                            aria-label="Mở menu"
                            aria-expanded={open}
                            aria-controls="mobile-menu"
                            onClick={() => setOpen(true)}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                aria-hidden="true"
                            >
                                <path d="M4 7h16M4 12h16M4 17h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            <div
                className={clsx(style.backdrop, open && style.open)}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />
            <div
                id="mobile-menu"
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className={clsx(style.drawer, open && style.open)}
            >
                <button type="button" className={style.closeBtn} aria-label="Đóng menu" onClick={() => setOpen(false)}>
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
                <nav aria-label="Menu di động" className={style.drawerNav}>
                    {links}
                </nav>
                <div className={style.drawerAccount}>{account}</div>
                <Button href={PATH.BookRoom} size="lg" block>
                    Đặt phòng
                </Button>
            </div>
        </>
    );
};

export default Header;
