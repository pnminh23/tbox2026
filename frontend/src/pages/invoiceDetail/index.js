import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAccount from '@/layout/LayoutAccount/LayoutAccount';
import AllBookingPage from '@/components/page/User/AllBooking';

export default function Page() {
    return (
        <>
            <PageHead title="Lịch sử đặt phòng" />
            <AllBookingPage />
        </>
    );
}

Page.getLayout = (page) => <LayoutAccount title="Lịch sử đặt phòng">{page}</LayoutAccount>;
