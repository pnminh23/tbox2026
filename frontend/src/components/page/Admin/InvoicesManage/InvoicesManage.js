import { useEffect, useMemo, useState } from 'react';
import styles from './InvoicesManage.module.scss';
import {
    editBooking,
    useAllBookings,
    useAllBookingsByDate,
    useAllBookingsByMonth,
    useBookingById,
} from '@/services/booking';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagonation';
import { AiOutlineDelete, AiOutlineEye, AiOutlineSearch } from 'react-icons/ai';
import Button from '@/components/common/Button';
import Tippy from '@tippyjs/react';
import Popup from '@/components/common/Popup/Popup';
import Input from '@/components/common/Input';
import { useAllFilms } from '@/services/films';
import dayjs from 'dayjs';
import { formatMoney } from '@/function/formatMoney';
import { toast } from 'react-toastify';
import Calendar from '@/components/common/Calender';

const InvoicesManage = () => {
    const [searchInput, setSearchInput] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isPopupEdit, setIsPopupEdit] = useState(false);

    const { bookings } = useAllBookings();
    const { booking, mutate: mutateBookingbyId } = useBookingById(selectedBookingId);
    const { bookings: bookingsByDate } = useAllBookingsByDate(selectedDate);
    console.log('selectedMonth: ', selectedMonth);
    const { bookings: bookingsByMonth } = useAllBookingsByMonth(selectedMonth);
    const { films } = useAllFilms();

    const filteredData = useMemo(() => {
        if (selectedDate) return bookingsByDate || [];
        if (selectedMonth) return bookingsByMonth || [];
        return bookings || [];
    }, [bookings, bookingsByDate, bookingsByMonth, selectedDate, selectedMonth]);

    const filteredBookings = useMemo(() => {
        if (!filteredData) return [];
        if (!activeSearchQuery) return filteredData;

        const query = activeSearchQuery.toLowerCase();
        return filteredData.filter(
            (b) =>
                b.id_booking === query ||
                b.name_client?.toLowerCase().includes(query) ||
                b.email?.toLowerCase().includes(query) ||
                b.phone?.toLowerCase().includes(query) ||
                b.room?.name?.toLowerCase().includes(query) ||
                b.status?.toLowerCase().includes(query) ||
                b.isPay?.toLowerCase().includes(query)
        );
    }, [filteredData, activeSearchQuery]);

    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedBookings = useMemo(() => {
        return filteredBookings.slice((currentPage - 1) * limit, currentPage * limit);
    }, [filteredBookings, currentPage, limit]);

    const tableData = paginatedBookings.map((b, i) => ({
        _id: b.id_booking,
        index: i + 1,
        name_client: b.name_client,
        email: b.email,
        phone: b.phone,
        date: dayjs(b.date).format('DD/MM/YYYY'),
        status: b.status,
        isPay: b.isPay,
        total_money: formatMoney(b.total_money),
    }));

    const handleGetBooking = (_id) => {
        setSelectedBookingId(_id);
        setIsPopupEdit(true);
        console.log('booking by id: ',booking)
    };

    const handleCancelBooking = async () => {
        if (!booking) return;
        if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng "${booking._id}" không?`)) return;

        try {
            const result = await editBooking(booking._id, { status: 'HỦY' });
            if (result.success) {
                toast.success('Đã hủy đơn đặt phòng thành công!');
                mutateBookingbyId();
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn.');
            console.error(error);
        }
    };

    const handleCompleteBooking = async () => {
        if (!booking) return;

        try {
            const result = await editBooking(booking._id, { status: 'HOÀN THÀNH', isPay: 'ĐÃ THANH TOÁN' });
            if (result.success) {
                toast.success('Đã hoàn tất đơn đặt phòng!');
                mutateBookingbyId();
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hoàn tất đơn.');
            console.error(error);
        }
    };

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSelectedDate('');
        setSelectedMonth('');
    };

    return (
        <div className={styles.InvoicesManageContainer}>
            {isPopupEdit && (
                <Popup
                    handleClose={() => {
                        setIsPopupEdit(false);
                        setSelectedBookingId(null);
                    }}
                >
                    <div className={styles.formPopup}>
                        <h5 className={styles.title}>Chi tiết đặt phòng</h5>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Mã hóa đơn:</p>
                                <Input rounded_10 disabled value={selectedBookingId} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Trạng thái đơn hàng:</p>
                                <Input rounded_10 disabled value={booking?.status} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Tên khách hàng:</p>
                                <Input disabled rounded_10 value={booking?.name_client} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Số điện thoại:</p>
                                <Input rounded_10 disabled value={booking?.phone} />
                            </div>
                        </div>
                        <div className={styles.groupItem}>
                            <p className={styles.label}>Email:</p>
                            <Input rounded_10 disabled value={booking?.email} />
                        </div>
                        <div className={styles.groupItem}>
                            <p className={styles.label}>Phim:</p>
                            <Input rounded_10 disabled value={booking?.film.name} />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Cơ sở:</p>
                                <Input rounded_10 disabled value={booking?.room.branch.name} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Phòng:</p>
                                <Input rounded_10 disabled value={booking?.room.name} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Loại phòng:</p>
                                <Input rounded_10 disabled value={booking?.room.type.name} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Ngày đặt phòng:</p>
                                <Input rounded_10 disabled value={dayjs(booking?.date).format('DD/MM/YYYY')} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Giờ bắt đầu:</p>
                                <Input rounded_10 disabled value={booking?.time_slots[0].start_time} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Giờ kết thúc:</p>
                                <Input rounded_10 disabled value={booking?.time_slots.at(-1).end_time} />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Mã khuyến mãi:</p>
                                <Input rounded_10 disabled value={booking?.promotion || 'Không có'} />
                            </div>
                            <div className={styles.groupItem}>
                                <p className={styles.label}>Combo:</p>
                                <Input rounded_10 disabled value={booking?.combo?.name || 'Không có'} />
                            </div>
                        </div>
                        <div className={styles.action}>
                            <div className={styles.row}>
                                <p className={styles.label}>Tổng tiền:</p>
                                <p className={styles.label}>{`${formatMoney(booking?.total_money)} - (${
                                    booking?.isPay
                                })`}</p>
                            </div>
                            <div className={styles.row}>
                                {booking?.status !== 'ĐÃ HỦY' && (
                                    <Button rounded_10 red w_fit onClick={handleCancelBooking}>
                                        Hủy đơn
                                    </Button>
                                )}

                                <Button rounded_10 yellowLinear w_fit onClick={handleCompleteBooking}>
                                    Hoàn tất đơn đặt
                                </Button>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
            <div className={styles.filter}>
                <div className={styles.search}>
                    <Input
                        placeholder="Tìm theo mã đơn, tên, SĐT, email, phòng, trạng thái,..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePerformSearch()}
                        rounded_10
                        outLine
                    />
                    <Button rounded_10 yellowLinear w_fit icon={<AiOutlineSearch />} onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                </div>
                <div className={styles.dateFilter}>
                    {/* <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedMonth('');
                        }}
                        rounded_10
                    /> */}
                    <Calendar
                        type="date"
                        selectedDate={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            setSelectedMonth('');
                        }}
                    />
                    <Calendar
                        type="month"
                        selectedDate={selectedMonth}
                        onChange={(date) => {
                            setSelectedMonth(date);
                            setSelectedDate('');
                        }}
                    />
                    {/* <Input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setSelectedDate('');
                        }}
                        rounded_10
                    /> */}
                    <Button grey w_fit rounded_10 onClick={handleClearFilters}>
                        Xóa bộ lọc
                    </Button>
                </div>
            </div>
            <div className={styles.content}>
                <Table
                    data={tableData}
                    columns={[
                        { key: 'index', label: 'STT' },
                        { key: '_id', label: 'Mã đơn hàng' },
                        { key: 'name_client', label: 'Tên khách hàng' },
                        { key: 'phone', label: 'Số điện thoại' },
                        {
                            key: 'status',
                            label: 'Trạng thái đơn hàng',
                            render: (item) => {
                                let statusClassName;
                                switch (item.status) {
                                    case 'HOÀN THÀNH':
                                        statusClassName = styles.completed;
                                        break;
                                    case 'THÀNH CÔNG':
                                        statusClassName = styles.successful;
                                        break;
                                    case 'ĐÃ HỦY':
                                        statusClassName = styles.cancelled;
                                        break;
                                    case 'THẤT BẠI':
                                        statusClassName = styles.failed;
                                        break;
                                    default:
                                        // Một lớp mặc định cho các trạng thái khác (nếu có)
                                        statusClassName = styles.statusDefault;
                                        break;
                                }

                                // Luôn trả về (return) một phần tử JSX để hiển thị
                                // Kết hợp className chung và className riêng của từng trạng thái
                                return <span className={`${styles.badge} ${statusClassName}`}>{item.status}</span>;
                            },
                        },
                        {
                            key: 'isPay',
                            label: 'Tình trạng thanh toán',
                            render: (item) => {
                                let isPayClassName;
                                switch (item.isPay) {
                                    case 'ĐÃ THANH TOÁN':
                                        isPayClassName = styles.completed;
                                        break;
                                    case 'ĐÃ THANH TOÁN 50%':
                                        isPayClassName = styles.successful;
                                        break;
                                    case 'CHƯA THANH TOÁN':
                                        isPayClassName = styles.failed;
                                        break;

                                    default:
                                        // Một lớp mặc định cho các trạng thái khác (nếu có)
                                        isPayClassName = styles.default;
                                        break;
                                }

                                // Luôn trả về (return) một phần tử JSX để hiển thị
                                // Kết hợp className chung và className riêng của từng trạng thái
                                return <span className={`${styles.badge} ${isPayClassName}`}>{item.isPay}</span>;
                            },
                        },
                        { key: 'date', label: 'Ngày đặt' },
                        { key: 'total_money', label: 'Tổng tiền' },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tippy content="Chi tiết" placement="bottom">
                                <div>
                                    <Button
                                        w_fit
                                        rounded_10
                                        p_10_14
                                        blueIcon
                                        icon={<AiOutlineEye />}
                                        onClick={() => handleGetBooking(item._id)}
                                    />
                                </div>
                            </Tippy>
                            <Tippy content="Xóa" placement="bottom">
                                <div>
                                    <Button w_fit rounded_10 p_10_14 redIcon icon={<AiOutlineDelete />} />
                                </div>
                            </Tippy>
                        </>
                    )}
                />
                <Pagination
                    className={styles.pagination}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={(page) => setCurrentPage(page)}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
};

export default InvoicesManage;
