import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAccount from '@/layout/LayoutAccount/LayoutAccount';
import AccountPage from '@/components/page/User/AccountPage';

export default function Page() {
    return (
        <>
            <PageHead title="Tài khoản" />
            <AccountPage />
        </>
    );
}

Page.getLayout = (page) => <LayoutAccount title="Tài khoản">{page}</LayoutAccount>;
