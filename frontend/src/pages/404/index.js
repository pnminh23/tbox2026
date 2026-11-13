// pages/404.js
import Link from 'next/link';
import style from './Pages404.module.scss';
import plugImage from '@public/static/img/background/Group_310.svg';
import Image from 'next/image';

export default function Custom404() {
    return (
        <div className={style.container}>
            <div className={style.content}>
                <h1>404</h1>
                <p>Rất tiếc, trang bạn yêu cầu không tìm thấy, vui lòng quay lại trang chủ</p>
                <Link href="/" className={style.button}>
                    Quay về trang chủ
                </Link>
            </div>
            <div className={style.image}>
                <Image src={plugImage} alt="ảnh" className={style.svg} />
            </div>
        </div>
    );
}
