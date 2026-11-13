import { useRouter } from 'next/router';
import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import NewsDetail from '@/components/page/User/NewsDetail';
import { useNews } from '@/services/news';

export default function News() {
    const { _id } = useRouter().query;
    const { news, isLoading } = useNews(_id);

    return (
        <>
            <PageHead title={news?.title || 'Tin tức'} />
            <NewsDetail news={news} isLoading={isLoading || !_id} />
        </>
    );
}

News.getLayout = (page) => <LayoutUser>{page}</LayoutUser>;
