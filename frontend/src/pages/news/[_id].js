import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import NewsDetail from '@/components/page/User/NewsDetail';
import { useRouter } from 'next/router';
import { useNews } from '@/services/news';
export default function News() {
    const router = useRouter();
    const { _id } = router.query;
    const { news } = useNews(_id);

    return (
        <>
            <PageHead title="Chi tiết tin tức" />
            <NewsDetail news={news} />
        </>
    );
}
News.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
