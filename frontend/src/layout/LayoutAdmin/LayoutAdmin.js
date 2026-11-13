import HeaderAdmin from '@/components/common/HeaderAdmin';
import style from './LayoutAdmin.module.scss';
import MenuTab from '@/components/common/MenuTab';
import { useState } from 'react';
import clsx from 'clsx';
import useAuthGuard from '@/hooks/useAuthGuard';

// user = true: trang tài khoản người dùng; ngược lại là trang admin
const LayoutAdmin = ({ user, children, dark, title }) => {
    const [collapsed, setCollapsed] = useState(false);
    const allowed = useAuthGuard(user ? undefined : 'admin');

    if (!allowed) return null;

    return (
        <div className={clsx(style.container, user && style.user)}>
            <div className={clsx(style.header, collapsed && style.collapsed)}>
                <HeaderAdmin dark={dark} title={title} onToggleSidebar={() => setCollapsed((prev) => !prev)} />
            </div>

            <div className={style.menutab}>
                <MenuTab user={user} dark={dark} collapsed={collapsed} />
            </div>

            <main className={clsx(style.main, collapsed && style.collapsed)}>{children}</main>
        </div>
    );
};

export default LayoutAdmin;
