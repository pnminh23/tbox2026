import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { getdata, useUserData } from '@/services/account';
import { logout } from '@/services/auth';
import { AiOutlineLogout, AiOutlineIdcard } from 'react-icons/ai';
import logoSrc from '../../../../public/static/img/logoBOX.svg';
import { AiOutlineMenu } from 'react-icons/ai';
import Image from 'next/image';
import Link from 'next/link';
import style from './Header.module.scss';
import 'swiper/css';
import 'swiper/css/navigation';
import { PATH } from '@/constants/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountBadge from '../AccountBadge';

const Header = () => {
    const router = useRouter();
    const [activePath, setActivePath] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, isLoading, isError } = useUserData();
    console.log('role user:', user?.role);
    useEffect(() => {
        setActivePath(router.pathname);
    }, [router.pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const closeMenu = () => setIsMenuOpen(false);

    const menuItemPath = [
        { path: PATH.Home, label: 'Trang chủ' },
        { path: PATH.ListFilm, label: 'Danh sách phim' },
        { path: PATH.BookRoom, label: 'Đặt phòng' },
        { path: PATH.News, label: 'Tin tức' },
        { path: PATH.Combo, label: 'Combo' },
        { path: PATH.Locations, label: 'Hệ thống PNM - BOX' },
    ];

    return (
        <div className={style.header}>
            <div className="container">
                <div className={style.container}>
                    <div className={style.headerLeft}>
                        <div className={style.menuicon} onClick={toggleMenu}>
                            <AiOutlineMenu />
                        </div>

                        <Image src={logoSrc} className={style.logo} alt="logo" priority />

                        <ul className={`${style.menu} ${isMenuOpen ? style.active : ''}`}>
                            {menuItemPath.map(({ path, label }) => (
                                <li key={path} className={activePath === path ? style.active : ''}>
                                    <Link href={path} onClick={closeMenu}>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={style.headerRight}>
                        {isLoading ? (
                            <p>Đang tải...</p> // hoặc spinner
                        ) : user ? (
                            <div className={style.userSection}>
                                <p>Xin chào</p>
                                <AccountBadge user={user} />
                            </div>
                        ) : (
                            <div className={style.login}>
                                <Link href={PATH.Register}>Đăng ký</Link>
                                <Link href={PATH.Login}>Đăng nhập</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
