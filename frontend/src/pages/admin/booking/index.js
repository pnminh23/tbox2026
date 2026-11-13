import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import BookingManger from '@/components/page/Admin/BookingManger/BookingManger';

const title = 'Quản lý đặt phòng';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <BookingManger />
        </>
    );
}
Account.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin admin title={title}>
            {page}
        </LayoutAdmin>
    );
};
