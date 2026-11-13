import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import { Button } from '@/components/ui';
import { PATH } from '@/constants/config';
import style from './Pages404.module.scss';

export default function Custom404() {
    return (
        <section className={style.page}>
            <PageHead title="Không tìm thấy trang" />
            <p className={style.code} aria-hidden="true">
                404
            </p>
            <h1>Phòng này không có trên bản đồ</h1>
            <p className={style.lead}>
                Đường dẫn sai hoặc trang đã bị gỡ. Bạn quay lại trang chủ hoặc đặt phòng luôn nhé.
            </p>
            <div className={style.actions}>
                <Button href={PATH.BookRoom} size="lg">
                    Đặt phòng
                </Button>
                <Button href="/" variant="outline" size="lg">
                    Về trang chủ
                </Button>
            </div>
        </section>
    );
}

Custom404.getLayout = (page) => <LayoutUser>{page}</LayoutUser>;
