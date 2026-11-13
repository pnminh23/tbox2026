import { useRouter } from 'next/router';
import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import BookingDetail from '@/components/page/User/BookingDetail/BookingDetail';

export default function BookingPage() {
    const { _id } = useRouter().query;
    return (
        <>
            <PageHead title={_id ? `Vé #${_id}` : 'Vé của bạn'} />
            <BookingDetail id={_id} />
        </>
    );
}

BookingPage.getLayout = (page) => <LayoutUser>{page}</LayoutUser>;
