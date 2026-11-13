import PageHead from '@/components/common/PageHead/PageHead';
import OverviewPage from '@/components/page/User/OverviewPage';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';

const title = 'Tổng quan tài khoản';
export default function Profile() {
    return (
        <>
            <PageHead title={title} />
            <OverviewPage />
        </>
    );
}
Profile.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin user dark title={title}>
            {page}
        </LayoutAdmin>
    );
};
