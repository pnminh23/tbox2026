import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import AllBookingPage from '@/components/page/User/AllBooking';

const title = 'Lịch sử đặt phòng';
export default function AllBooking() {
    return (
        <>
            <PageHead title={title} />
            <AllBookingPage />
        </>
    );
}
AllBooking.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin user dark title={title}>
            {page}
        </LayoutAdmin>
    );
};
