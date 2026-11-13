import Image from 'next/image';
import Link from 'next/link';
import { AiOutlineFacebook, AiOutlineInstagram, AiOutlineYoutube } from 'react-icons/ai';
import logo from '@public/static/img/logoBOX.svg';
import { useAllBranches } from '@/services/branch';
import { PATH } from '@/constants/config';
import style from './Footer.module.scss';

const SOCIALS = [
    { label: 'Facebook PNM BOX', icon: AiOutlineFacebook },
    { label: 'Instagram PNM BOX', icon: AiOutlineInstagram },
    { label: 'YouTube PNM BOX', icon: AiOutlineYoutube },
];

function Footer() {
    const { branches } = useAllBranches();

    return (
        <footer className={style.footer}>
            <div className={style.inner}>
                <div className={style.brand}>
                    <Image src={logo} alt="PNM BOX" height={40} />
                    <p>Cafe phim phòng riêng. Chọn giờ, vào phòng, tắt đèn.</p>
                    <div className={style.socials}>
                        {SOCIALS.map(({ label, icon: Icon }) => (
                            <a key={label} href="#" aria-label={label} className={style.social}>
                                <Icon aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className={style.heading}>Cơ sở</h2>
                    <ul className={style.list}>
                        {branches?.map((b) => (
                            <li key={b._id}>
                                <strong>{b.name}</strong>
                                <span>{b.address}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className={style.heading}>Khám phá</h2>
                    <ul className={style.list}>
                        <li>
                            <Link href={PATH.BookRoom}>Đặt phòng</Link>
                        </li>
                        <li>
                            <Link href={PATH.Combo}>Combo</Link>
                        </li>
                        <li>
                            <Link href={PATH.ListFilm}>Phim</Link>
                        </li>
                        <li>
                            <Link href={PATH.News}>Tin tức</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <p className={style.copy}>© {new Date().getFullYear()} PNM BOX. Dành cho khách trên 18 tuổi.</p>
        </footer>
    );
}

export default Footer;
