import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import NewsPage from '@/components/page/User/NewsPage';
export default function Discount() {
    return (
        <>
            <PageHead title="Tin tức" />
            <NewsPage />
        </>
    );
}
Discount.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
