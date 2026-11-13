import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import BannerManage from '@/components/page/Admin/BannerManage/BannerManage';

const title = 'Quản lý Banner trang chủ';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <BannerManage />
        </>
    );
}
Account.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin admin title={title}>
            {page}
        </LayoutAdmin>
    );
};
