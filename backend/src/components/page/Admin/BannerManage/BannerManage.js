import Button from '@/components/common/Button';
import styles from './BannerManage.module.scss';
import { AiOutlineUpload } from 'react-icons/ai';

const BannerManage = () => {
    return (
        <div className={styles.container}>
            <p> Có 3 banner trên trang chủ</p>
            <div className={styles.ListBanner}></div>
            <Button rounded_10 w_fit blue icon={<AiOutlineUpload />} className={styles.btnAdd}>
                Thêm banner
            </Button>
        </div>
    );
};

export default BannerManage;
