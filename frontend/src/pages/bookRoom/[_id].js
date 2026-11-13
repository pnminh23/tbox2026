import PageHead from "@/components/common/PageHead/PageHead";
import LayoutUser from "@/layout/LayoutUser/LayoutUser";
import { useRouter } from "next/router";
import { useBookingById } from "@/services/booking";
import BookingDetail from "@/components/page/User/BookingDetail/BookingDetail";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    },
);
export default function Booking() {
    const router = useRouter();
    const { _id } = router.query;

    const { booking, isLoading, isError } = useBookingById(_id);

    if (isLoading) {
        return <DynamicLoadingFullPage />;
    }

    if (isError || !booking) {
        return <div>Không tìm thấy đơn đặt phòng hoặc đã có lỗi xảy ra.</div>;
    }

    return (
        <>
            <PageHead title={`Đơn #${booking.id_booking}`} />
            <BookingDetail booking={booking} />
        </>
    );
}

Booking.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
