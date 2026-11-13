import Footer from '@/components/common/Footer/Footer';
import style from './LayoutUser.module.scss';
import Header from '@/components/common/Header';
import Chatbot from '@/components/common/ChatBot';
const LayoutUser = ({ children }) => {
    // Nhận children từ props
    return (
        <>
            <div className={style.header}>
                <Header />
            </div>
            <main className={style.main}>{children}</main>

            <Chatbot />
            <div className={style.footer}>
                <Footer />
            </div>
        </>
    );
};

export default LayoutUser;
