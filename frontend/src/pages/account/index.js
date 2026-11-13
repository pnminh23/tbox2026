import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import AccountPage from '@/components/page/User/AccountPage';

const title = 'Tài khoản';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <AccountPage />
        </>
    );
}
Account.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin user dark title={title}>
            {page}
        </LayoutAdmin>
    );
};
