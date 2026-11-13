import Link from "next/link";
import style from "./MenuTab.module.scss";
import clsx from "clsx";
import {
    AiOutlinePieChart,
    AiOutlineUser,
    AiOutlineReconciliation,
    AiOutlineCalendar,
    AiOutlinePicture,
    AiOutlineVideoCamera,
    AiOutlineHome,
    AiOutlineGift,
    AiOutlineShopping,
    AiOutlineBarChart,
    AiOutlineProfile,
    AiOutlineForm,
} from "react-icons/ai";
import logo from "@public/favicon.ico";
import Image from "next/image";
import { PATH } from "@/constants/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
const MenuTab = ({ user, dark, collapsed }) => {
    const router = useRouter();
    const activePath = router.pathname; // Không cần useState/useEffect

    const menuItemPathUser = [
        {
            path: PATH.Overview,
            label: "Tổng quan",
            icon: <AiOutlinePieChart />,
        },
        { path: PATH.Account, label: "Tài khoản", icon: <AiOutlineUser /> },
        {
            path: PATH.InvoiceDetail,
            label: "Lịch sử đặt phòng",
            icon: <AiOutlineReconciliation />,
        },
    ];
    const menuItemPathAdmin = [
        {
            path: PATH.BookRoomManagement,
            label: "Quản lý đặt phòng",
            icon: <AiOutlineCalendar />,
        },
        {
            path: PATH.AccountManagement,
            label: "Quản lý tài khoản",
            icon: <AiOutlineUser />,
        },
        {
            path: PATH.FilmManagement,
            label: "Quản lý phim",
            icon: <AiOutlineVideoCamera />,
        },
        {
            path: PATH.LocationsManagement,
            label: "Quản lý cơ sở",
            icon: <AiOutlineHome />,
        },
        {
            path: PATH.NewsManagement,
            label: "Quản lý tin tức",
            icon: <AiOutlineForm />,
        },
        {
            path: PATH.ComboManagement,
            label: "Quản lý combo",
            icon: <AiOutlineShopping />,
        },
        {
            path: PATH.PromotionManagement,
            label: "Quản lý Khuyến mãi",
            icon: <AiOutlineGift />,
        },
        {
            path: PATH.InvoiceManagement,
            label: "Quản lý đơn đặt",
            icon: <AiOutlineProfile />,
        },
        {
            path: PATH.StatisicalManagement,
            label: "Thông kê",
            icon: <AiOutlineBarChart />,
        },
    ];

    const menuItemPath = user ? menuItemPathUser : menuItemPathAdmin;

    return (
        <div
            className={clsx(
                style.container,
                dark && style.dark,
                collapsed && style.collapsed
            )}>
            <Image src={logo} width={50} height={50} alt="Logo" />
            <ul className={style.menu}>
                {menuItemPath.map(({ path, label, icon }) => (
                    <li
                        key={path}
                        className={clsx(
                            activePath === path && style.active,
                            user && style.user
                        )}>
                        <Link href={path}>
                            {icon}
                            <p className={clsx(collapsed && style.none)}>
                                {label}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MenuTab;
