import Image from 'next/image';
import Link from 'next/link';
import heroImg from '@public/static/img/hero-room.jpg';
import logoSrc from '@public/static/img/logoBOX.svg';
import { PATH } from '@/constants/config';
import style from './LayoutAuth.module.scss';

/** Khung trang đăng nhập / đăng ký: ảnh phòng bên trái (desktop), form bên phải. */
const LayoutAuth = ({ title, lead, children }) => (
    <div className={`theme-box ${style.root}`}>
        <div className={style.photo} aria-hidden="true">
            <Image src={heroImg} alt="" fill sizes="50vw" placeholder="blur" />
            <p>Chọn giờ, vào phòng, tắt đèn.</p>
        </div>
        <main className={style.panel}>
            <Link href={PATH.Home} className={style.logo} aria-label="PNM BOX, về trang chủ">
                <Image src={logoSrc} alt="" height={34} />
            </Link>
            <div className={style.card}>
                <h1>{title}</h1>
                {lead && <p className={style.lead}>{lead}</p>}
                {children}
            </div>
        </main>
    </div>
);

export default LayoutAuth;
