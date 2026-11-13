import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import InvoicesManage from '@/components/page/Admin/InvoicesManage/InvoicesManage';

const title = 'Quản lý đơn đặt hàng';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <InvoicesManage />
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
