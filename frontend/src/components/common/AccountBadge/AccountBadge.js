import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { AiOutlineAppstore, AiOutlineIdcard, AiOutlineLogout } from 'react-icons/ai';
import avatar from '@public/static/img/avatar/panda.png';
import { PATH } from '@/constants/config';
import { logout } from '@/services/auth';
import styles from './AccountBadge.module.scss';

/** Avatar + menu tài khoản (dùng cho header khách và admin). */
const AccountBadge = ({ user }) => {
    const ref = useRef(null);
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push(PATH.Login);
        } catch {
            toast.error('Đăng xuất thất bại, vui lòng thử lại');
        }
    };

    return (
        <div className={styles.badge} ref={ref}>
            <button
                type="button"
                className={styles.trigger}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
            >
                <Image src={user.image || avatar} alt="" width={32} height={32} className={styles.img} />
                <span className={styles.userName}>{user.name}</span>
            </button>
            {open && (
                <div className={styles.menu} role="menu">
                    {user.role === 'admin' && (
                        <Link href={PATH.BookRoomManagement} className={styles.item} role="menuitem">
                            <AiOutlineAppstore aria-hidden="true" />
                            Trang quản trị
                        </Link>
                    )}
                    <Link href={PATH.Overview} className={styles.item} role="menuitem">
                        <AiOutlineIdcard aria-hidden="true" />
                        Tài khoản và lịch sử đặt
                    </Link>
                    <button
                        type="button"
                        className={`${styles.item} ${styles.danger}`}
                        role="menuitem"
                        onClick={handleLogout}
                    >
                        <AiOutlineLogout aria-hidden="true" />
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccountBadge;
