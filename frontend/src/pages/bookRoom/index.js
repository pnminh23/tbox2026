import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import BookRoomPage from '@/components/page/User/BookRoomPage';
export default function BookRoom() {
    return (
        <>
            <PageHead title="Đặt phòng" />
            <BookRoomPage />
        </>
    );
}
BookRoom.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
