import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import PromotionManage from '@/components/page/Admin/PromotionManage/PromotionManage';

const title = 'Quản lý mã khuyến mãi';
export default function Promotion() {
    return (
        <>
            <PageHead title={title} />
            {/* <NewsManage /> */}
            <PromotionManage />
        </>
    );
}
Promotion.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin admin title={title}>
            {page}
        </LayoutAdmin>
    );
};
