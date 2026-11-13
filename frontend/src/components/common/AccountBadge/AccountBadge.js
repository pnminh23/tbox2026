import { useEffect, useRef, useState } from 'react';
import styles from './AccountBadge.module.scss';
import avatar from '@public/static/img/avatar/panda.png';

import { AiOutlineAppstore, AiOutlineIdcard, AiOutlineLogout } from 'react-icons/ai';
import { PATH } from '@/constants/config';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { logout } from '@/services/auth';
import { useRouter } from 'next/router';

const AccountBadge = ({ user }) => {
    const menuAccountRef = useRef(null);
    const router = useRouter();
    const [isMenuAccount, setIsMenuAccount] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuAccountRef.current && !menuAccountRef.current.contains(event.target)) {
                setIsMenuAccount(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();

            setTimeout(() => {
                router.push(PATH.Login);
            }, 2000);
        } catch (error) {
            toast.error('Lỗi khi đăng xuất!', { autoClose: 2000 });
        }
    };

    return (
        <>
            <p className={styles.userName}>{user.name}</p>
            <div className={styles.avatarContainer} ref={menuAccountRef}>
                <Image
                    src={user.image || avatar}
                    alt="avatar"
                    width={30}
                    height={30}
                    className={styles.img}
                    onClick={() => setIsMenuAccount(!isMenuAccount)}
                />
                {isMenuAccount && (
                    <div className={styles.dropdownMenu}>
                        {user?.role === 'admin' && (
                            <div className={styles.menuItem}>
                                <AiOutlineAppstore />
                                <Link href={PATH.BookRoomManagement}>Trang quản trị</Link>
                            </div>
                        )}
                        <div className={styles.menuItem}>
                            <AiOutlineIdcard />
                            <Link href={PATH.Overview}>Quản lý tài khoản</Link>
                        </div>
                        <div className={clsx(styles.menuItem)} onClick={handleLogout}>
                            <AiOutlineLogout className={styles.red} />
                            <p className={styles.red}>Đăng xuất</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AccountBadge;
