import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import AccountManage from '@/components/page/Admin/AccountManage/AccountManage';

const title = 'Quản lý tài khoản người dùng';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <AccountManage />
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
