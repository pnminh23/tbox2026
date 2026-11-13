import style from './HeaderAdmin.module.scss';
import clsx from 'clsx';
import { AiOutlineMenu } from 'react-icons/ai';
import Button from '../Button';
import AccountBadge from '../AccountBadge';
import { useUserData } from '@/services/account';

const HeaderAdmin = ({ dark, title = 'HeaderAdmin', onToggleSidebar }) => {
    const { user, isLoading, isError } = useUserData(); // 🎉 dùng hook

    return (
        <div className={clsx(style.container, dark && style.dark)}>
            <div className={style.title}>
                <AiOutlineMenu onClick={onToggleSidebar} />
                <p>{title}</p>
            </div>
            <div className={style.account}>
                <Button rounded_10 w_fit red href="/">
                    Trang chủ
                </Button>

                {isLoading ? (
                    <p>Đang tải...</p> // bạn có thể thay bằng spinner
                ) : user ? (
                    <AccountBadge user={user} />
                ) : (
                    <p>Chưa đăng nhập</p> // hoặc null tùy UI
                )}
            </div>
        </div>
    );
};

export default HeaderAdmin;
