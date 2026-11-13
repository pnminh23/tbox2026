import PageHead from '@/components/common/PageHead/PageHead';
import HomePage from '@/components/page/User/HomePage';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';

export default function Home() {
    return (
        <>
            <PageHead title="Cafe phim phòng riêng" />
            <HomePage />
        </>
    );
}

// Sử dụng getLayout để bọc trang trong LayoutUser
Home.getLayout = function getLayout(page) {
    return <LayoutUser overlay>{page}</LayoutUser>;
};
