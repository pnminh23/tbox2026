import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import ComboManage from '@/components/page/Admin/ComboManage/ComboManage';

const title = 'Quản lý các combo';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <ComboManage />
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
