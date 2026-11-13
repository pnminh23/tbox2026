import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAccount from '@/layout/LayoutAccount/LayoutAccount';
import OverviewPage from '@/components/page/User/OverviewPage';

export default function Page() {
    return (
        <>
            <PageHead title="Tổng quan" />
            <OverviewPage />
        </>
    );
}

Page.getLayout = (page) => <LayoutAccount title="Tổng quan">{page}</LayoutAccount>;
