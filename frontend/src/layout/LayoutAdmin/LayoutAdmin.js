import HeaderAdmin from '@/components/common/HeaderAdmin';
import style from './LayoutAdmin.module.scss';
import MenuTab from '@/components/common/MenuTab';
import { useState } from 'react';
import clsx from 'clsx';
import useAdminAuth from '@/hooks/useAdminAuth';

const LayoutAdmin = ({ user, children, dark, title }) => {
    const [collapsed, setCollapsed] = useState(false);
    
    // Protect admin routes (client-side cho Vercel)
    useAdminAuth();

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

    return (
        <div className={clsx(style.container, user && style.user)}>
            <div className={clsx(style.header, collapsed && style.collapsed)}>
                <HeaderAdmin dark={dark} title={title} onToggleSidebar={toggleSidebar} />
            </div>

            <div className={style.menutab}>
                <MenuTab user={user} dark={dark} collapsed={collapsed} />
            </div>

            <main className={clsx(style.main, collapsed && style.collapsed)}>{children}</main>
        </div>
    );
};

export default LayoutAdmin;
