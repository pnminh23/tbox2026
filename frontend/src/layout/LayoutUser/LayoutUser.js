import clsx from 'clsx';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Chatbot from '@/components/common/ChatBot';
import style from './LayoutUser.module.scss';

/** Khung trang khách. overlay: header trong suốt đè lên hero (trang chủ). */
const LayoutUser = ({ children, overlay = false }) => (
    <div className={clsx('theme-box', style.root)}>
        <a href="#main" className={style.skip}>
            Bỏ qua tới nội dung chính
        </a>
        <Header overlay={overlay} />
        <main id="main" className={clsx(style.main, overlay && style.flush)}>
            {children}
        </main>
        <Chatbot />
        <Footer />
    </div>
);

export default LayoutUser;
