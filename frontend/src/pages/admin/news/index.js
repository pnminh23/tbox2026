import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import NewsManage from '@/components/page/Admin/NewsManage/NewsManage';

const title = 'Quản lý mã và tin khuyến mãi';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <NewsManage />
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
