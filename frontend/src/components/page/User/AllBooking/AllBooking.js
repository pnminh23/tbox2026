import { useEffect, useMemo, useState } from "react";
import style from "./AllBooking.module.scss";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// Services & Hooks
import {
    useAllBookingByEmail,
    useAllBookingByEmailAndMonth,
    useAllBookingByEmailCurrent,
} from "@/services/booking";

// Components
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Calendar from "@/components/common/Calender";
import ListInvoice from "@/components/common/ListInvoice";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false }
);
import { AiOutlineSearch } from "react-icons/ai";

const InvoiceDetailPage = () => {
    // === State Management ===
    const [activeFilter, setActiveFilter] = useState("Tất cả các đơn");
    const [selectedDateMonth, setSelectedDateMonth] = useState(null);
    const [apiMonth, setApiMonth] = useState(null);
    const [apiYear, setApiYear] = useState(null);
    // State mới cho tìm kiếm
    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");

    // === Data Fetching ===
    const { booking: allBookingCurrent, isLoading: loadingBookingCurrent } =
        useAllBookingByEmailCurrent();
    const { booking: allBooking, isLoading: loadingBooking } =
        useAllBookingByEmail();
    const { booking: allBookingByMonth, isLoading: loadingBookingByMonth } =
        useAllBookingByEmailAndMonth(apiMonth, apiYear);

    // === Event Handlers & Effects ===
    useEffect(() => {
        if (selectedDateMonth) {
            const monthForApi = selectedDateMonth.getMonth() + 1;
            const yearForApi = selectedDateMonth.getFullYear();
            setApiMonth(monthForApi);
            setApiYear(yearForApi);
        } else {
            setApiMonth(null);
            setApiYear(null);
        }
    }, [selectedDateMonth]);

    const handleFilterButtonClick = (filterType) => {
        setActiveFilter(filterType);
    };

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
    };

    // === Derived Data (Lọc và chọn dữ liệu để hiển thị) ===
    const displayBookings = useMemo(() => {
        let sourceData = [];

        // 1. Chọn nguồn dữ liệu dựa trên filter đang active
        switch (activeFilter) {
            case "Đơn hiện tại":
                sourceData = allBookingCurrent || [];
                break;
            case "Theo tháng":
                sourceData = allBookingByMonth || [];
                break;
            case "Tất cả các đơn":
            default:
                sourceData = allBooking || [];
                break;
        }

        // 2. Nếu có truy vấn tìm kiếm, lọc tiếp trên nguồn dữ liệu đã chọn
        if (!activeSearchQuery) {
            return sourceData;
        }

        const query = activeSearchQuery.toLowerCase();
        return sourceData.filter((booking) =>
            booking.id_booking?.toString().toLowerCase().includes(query)
        );
    }, [
        activeFilter,
        allBooking,
        allBookingCurrent,
        allBookingByMonth,
        activeSearchQuery,
    ]);

    const renderInvoices = () => {
        const isLoading =
            loadingBookingCurrent || loadingBooking || loadingBookingByMonth;
        if (isLoading && displayBookings.length === 0) {
            return (
                <div className={style.loadingItem}>
                    <DynamicLoadingItem />
                </div>
            );
        }
        if (activeFilter === "Theo tháng" && !selectedDateMonth) {
            return (
                <p className={style.message}>
                    Vui lòng chọn tháng để xem hóa đơn.
                </p>
            );
        }
        if (displayBookings.length === 0) {
            return (
                <p className={style.message}>Không có đơn hàng nào phù hợp.</p>
            );
        }
        return displayBookings.map((booking) => (
            <ListInvoice key={booking._id} booking={booking} />
        ));
    };

    return (
        <div className={style.container}>
            <div className={style.filter}>
                <div className={style.flexRow}>
                    <p>Lọc: </p>
                    <div className={style.filterButtonsContainer}>
                        <Button
                            h30
                            rounded_6
                            yellowLinear={activeFilter === "Đơn hiện tại"}
                            light={activeFilter !== "Đơn hiện tại"}
                            onClick={() =>
                                handleFilterButtonClick("Đơn hiện tại")
                            }
                            className={style.filterButton}>
                            Đơn hiện tại
                        </Button>
                        <Button
                            h30
                            rounded_6
                            yellowLinear={activeFilter === "Tất cả các đơn"}
                            light={activeFilter !== "Tất cả các đơn"}
                            onClick={() =>
                                handleFilterButtonClick("Tất cả các đơn")
                            }
                            className={style.filterButton}>
                            Tất cả các đơn
                        </Button>
                        <Button
                            h30
                            rounded_6
                            yellowLinear={activeFilter === "Theo tháng"}
                            light={activeFilter !== "Theo tháng"}
                            onClick={() =>
                                handleFilterButtonClick("Theo tháng")
                            }
                            className={style.filterButton}>
                            Theo tháng
                        </Button>
                    </div>
                    {activeFilter === "Theo tháng" && (
                        <div className={style.calendar}>
                            <Calendar
                                type="month"
                                selectedDate={selectedDateMonth}
                                onChange={(date) => setSelectedDateMonth(date)}
                            />
                        </div>
                    )}
                </div>
                <div className={style.flexRow}>
                    <p>Tìm kiếm: </p>
                    <Input
                        placeholder="Nhập mã hóa đơn"
                        rounded_10
                        className={style.input}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" && handlePerformSearch()
                        }
                    />
                    <Button
                        rounded_10
                        yellowLinear
                        className={style.search}
                        onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                </div>
            </div>
            <div className={style.listInvoiceContainer}>{renderInvoices()}</div>
        </div>
    );
};

export default InvoiceDetailPage;
