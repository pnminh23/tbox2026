import { useMemo, useState } from "react";
import style from "./Statisical.module.scss";
import dayjs from "dayjs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useAllBookings } from "@/services/booking";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);
import { formatMoney } from "@/function/formatMoney";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
import TimeFilter from "@/components/common/TimeFilter/TimeFilter";

// Helper function để tính phần trăm thay đổi
const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
};

// lấy tên bộ lọc
const filterDisplayNames = {
    today: "hôm nay",
    yesterday: "hôm qua",
    this_week: "tuần này",
    this_month: "tháng này",
    last_month: "tháng trước",
    this_year: "năm nay",
    last_year: "năm trước",
};

const Statisical = () => {
    const { bookings, isLoading, isError } = useAllBookings();
    // State giờ sẽ là một object chứa cả filter và range, mặc định là tuần này
    const [filter, setFilter] = useState({ filter: "this_week", range: null });

    const paidBookings = useMemo(() => {
        if (!bookings) return [];
        return bookings.filter((b) => b.isPay === "ĐÃ THANH TOÁN");
    }, [bookings]);

    // tính toán doanh thu
    const revenueStats = useMemo(() => {
        if (!paidBookings) return null;

        const now = dayjs();
        let currentStartDate, currentEndDate;
        let prevStartDate, prevEndDate;
        let groupByFormat = "YYYY-MM-DD";

        switch (filter.filter) {
            case "today":
                currentStartDate = now.startOf("day");
                currentEndDate = now.endOf("day");
                prevStartDate = now.subtract(1, "day").startOf("day");
                prevEndDate = now.subtract(1, "day").endOf("day");
                break;
            case "yesterday":
                currentStartDate = now.subtract(1, "day").startOf("day");
                currentEndDate = now.subtract(1, "day").endOf("day");
                prevStartDate = now.subtract(2, "day").startOf("day");
                prevEndDate = now.subtract(2, "day").endOf("day");
                break;
            case "this_week":
                currentStartDate = now.startOf("week");
                currentEndDate = now.endOf("week");
                prevStartDate = now.subtract(1, "week").startOf("week");
                prevEndDate = now.subtract(1, "week").endOf("week");
                break;
            case "this_month":
                currentStartDate = now.startOf("month");
                currentEndDate = now.endOf("month");
                prevStartDate = now.subtract(1, "month").startOf("month");
                prevEndDate = now.subtract(1, "month").endOf("month");
                break;
            case "last_month":
                currentStartDate = now.subtract(1, "month").startOf("month");
                currentEndDate = now.subtract(1, "month").endOf("month");
                prevStartDate = now.subtract(2, "month").startOf("month");
                prevEndDate = now.subtract(2, "month").endOf("month");
                break;
            case "this_year":
                currentStartDate = now.startOf("year");
                currentEndDate = now.endOf("year");
                prevStartDate = now.subtract(1, "year").startOf("year");
                prevEndDate = now.subtract(1, "year").endOf("year");
                groupByFormat = "YYYY-MM";
                break;
            case "last_year":
                currentStartDate = now.subtract(1, "year").startOf("year");
                currentEndDate = now.subtract(1, "year").endOf("year");
                prevStartDate = now.subtract(2, "year").startOf("year");
                prevEndDate = now.subtract(2, "year").endOf("year");
                groupByFormat = "YYYY-MM";
                break;
            case "custom":
                if (
                    filter.range &&
                    filter.range.startDate &&
                    filter.range.endDate
                ) {
                    currentStartDate = dayjs(filter.range.startDate).startOf(
                        "day"
                    );
                    currentEndDate = dayjs(filter.range.endDate).endOf("day");
                    const durationInDays = currentEndDate.diff(
                        currentStartDate,
                        "day"
                    );
                    prevEndDate = currentStartDate
                        .subtract(1, "day")
                        .endOf("day");
                    prevStartDate = prevEndDate
                        .subtract(durationInDays, "day")
                        .startOf("day");
                    if (durationInDays > 31) groupByFormat = "YYYY-MM";
                }
                break;
            default:
                currentStartDate = now.startOf("week");
                currentEndDate = now.endOf("week");
                prevStartDate = now.subtract(1, "week").startOf("week");
                prevEndDate = now.subtract(1, "week").endOf("week");
                break;
        }

        if (!currentStartDate || !currentEndDate) return null;

        const currentPeriodBookings = paidBookings.filter((b) =>
            dayjs(b.date).isBetween(
                currentStartDate,
                currentEndDate,
                null,
                "[]"
            )
        );
        const previousPeriodBookings = paidBookings.filter((b) =>
            dayjs(b.date).isBetween(prevStartDate, prevEndDate, null, "[]")
        );

        const revenueForCurrentPeriod = currentPeriodBookings.reduce(
            (acc, cur) => acc + cur.total_money,
            0
        );
        const orderCountForCurrentPeriod = currentPeriodBookings.length;
        const revenueForPreviousPeriod = previousPeriodBookings.reduce(
            (acc, cur) => acc + cur.total_money,
            0
        );
        const orderCountForPreviousPeriod = previousPeriodBookings.length;

        const revenueChange = calculatePercentageChange(
            revenueForCurrentPeriod,
            revenueForPreviousPeriod
        );
        const orderCountChange = calculatePercentageChange(
            orderCountForCurrentPeriod,
            orderCountForPreviousPeriod
        );

        const scaffold = new Map();
        let currentDate = currentStartDate.clone();
        const unit = groupByFormat === "YYYY-MM" ? "month" : "day";
        while (
            currentDate.isBefore(currentEndDate) ||
            currentDate.isSame(currentEndDate)
        ) {
            const key = currentDate.format(groupByFormat);
            scaffold.set(key, { date: key, total: 0, count: 0 });
            currentDate = currentDate.add(1, unit);
        }
        for (const booking of currentPeriodBookings) {
            const key = dayjs(booking.date).format(groupByFormat);
            if (scaffold.has(key)) {
                const data = scaffold.get(key);
                data.total += booking.total_money;
                data.count += 1;
            }
        }
        const chartData = Array.from(scaffold.values()).map((item) => ({
            ...item,
            displayDate: dayjs(item.date).format(
                groupByFormat === "YYYY-MM" ? "[Thg] MM/YYYY" : "DD-MM"
            ),
        }));

        return {
            revenueForCurrentPeriod,
            orderCountForCurrentPeriod,
            revenueChange,
            orderCountChange,
            chartData,
        };
    }, [paidBookings, filter]);

    // Hook tính toán trạng thái đơn hàng
    const statusChartData = useMemo(() => {
        if (!bookings) return [];
        const now = dayjs();
        let startDate, endDate;

        switch (filter.filter) {
            case "today":
                startDate = now.startOf("day");
                endDate = now.endOf("day");
                break;
            case "yesterday":
                startDate = now.subtract(1, "day").startOf("day");
                endDate = now.subtract(1, "day").endOf("day");
                break;
            case "this_week":
                startDate = now.startOf("week");
                endDate = now.endOf("week");
                break;
            case "this_month":
                startDate = now.startOf("month");
                endDate = now.endOf("month");
                break;
            case "last_month":
                startDate = now.subtract(1, "month").startOf("month");
                endDate = now.subtract(1, "month").endOf("month");
                break;
            case "this_year":
                startDate = now.startOf("year");
                endDate = now.endOf("year");
                break;
            case "last_year":
                startDate = now.subtract(1, "year").startOf("year");
                endDate = now.subtract(1, "year").endOf("year");
                break;
            case "custom":
                if (filter.range?.startDate && filter.range?.endDate) {
                    startDate = dayjs(filter.range.startDate).startOf("day");
                    endDate = dayjs(filter.range.endDate).endOf("day");
                }
                break;
            default:
                startDate = now.startOf("week");
                endDate = now.endOf("week");
                break;
        }

        if (!startDate || !endDate) return [];

        const scaffold = new Map();
        let currentDate = startDate.clone();
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
            const key = currentDate.format("YYYY-MM-DD");
            scaffold.set(key, {
                date: key,
                completed: 0,
                successful: 0,
                failed: 0,
                cancelled: 0,
            });
            currentDate = currentDate.add(1, "day");
        }
        const filteredBookings = bookings.filter((booking) =>
            dayjs(booking.date).isBetween(startDate, endDate, null, "[]")
        );
        for (const booking of filteredBookings) {
            const key = dayjs(booking.date).format("YYYY-MM-DD");
            if (scaffold.has(key)) {
                const data = scaffold.get(key);
                if (booking.status === "HOÀN THÀNH") data.completed += 1;
                else if (booking.status === "THÀNH CÔNG") data.successful += 1;
                else if (booking.status === "THẤT BẠI") data.failed += 1;
                else if (booking.status === "ĐÃ HỦY") data.cancelled += 1;
            }
        }
        return Array.from(scaffold.values()).map((item) => ({
            ...item,
            shortDate: dayjs(item.date).format("DD/MM"),
        }));
    }, [bookings, filter]);

    if (isLoading || !revenueStats) return <DynamicLoadingFullPage />;
    if (isError) return <div>Đã có lỗi xảy ra khi tải dữ liệu thống kê.</div>;

    const getFilterName = () => {
        if (
            filter.filter === "custom" &&
            filter.range?.startDate &&
            filter.range?.endDate
        ) {
            const start = dayjs(filter.range.startDate).format("DD/MM/YYYY");
            const end = dayjs(filter.range.endDate).format("DD/MM/YYYY");
            return `cho kỳ từ ${start} đến ${end}`;
        }
        return filterDisplayNames[filter.filter] || "kỳ này";
    };
    const filterName = getFilterName();

    return (
        <div className={style.wrapper}>
            <TimeFilter onFilterChange={setFilter} />

            <div className={style.summaryCards}>
                <div className={`${style.card} ${style.revenueCard}`}>
                    <p className={style.cardTitle}>
                        Tổng doanh thu {filterName}
                    </p>
                    <p className={style.cardValue}>
                        {formatMoney(revenueStats.revenueForCurrentPeriod)}
                    </p>
                    <div
                        className={`${style.percentageChange} ${
                            revenueStats.revenueChange >= 0
                                ? style.positive
                                : style.negative
                        }`}>
                        {revenueStats.revenueChange >= 0 ? (
                            <FaArrowTrendUp />
                        ) : (
                            <FaArrowTrendDown />
                        )}
                        {Math.abs(revenueStats.revenueChange)}%
                    </div>
                </div>
                <div className={`${style.card} ${style.orderCard}`}>
                    <p className={style.cardTitle}>
                        Tổng đơn hàng {filterName}
                    </p>
                    <p className={style.cardValue}>
                        {revenueStats.orderCountForCurrentPeriod}{" "}
                        <span className={style.unit}>đơn hàng</span>
                    </p>
                    <div
                        className={`${style.percentageChange} ${
                            revenueStats.orderCountChange >= 0
                                ? style.positive
                                : style.negative
                        }`}>
                        {revenueStats.orderCountChange >= 0 ? (
                            <FaArrowTrendUp />
                        ) : (
                            <FaArrowTrendDown />
                        )}
                        {Math.abs(revenueStats.orderCountChange)}%
                    </div>
                </div>
            </div>

            <div className={style.section}>
                <div className={style.header}>
                    <h2>Biểu đồ doanh thu</h2>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={revenueStats.chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickFormatter={(value) => `${value / 1000000}M`}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            formatter={(value) => [
                                formatMoney(value),
                                "Doanh thu",
                            ]}
                        />
                        <Legend />
                        <Bar
                            dataKey="total"
                            fill="#f3b817"
                            name="Doanh thu"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className={style.section}>
                <div className={style.header}>
                    <h2>Thống kê trạng thái đơn hàng</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={statusChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="shortDate"
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ top: -10, right: 0 }} />
                        <Bar
                            dataKey="completed"
                            stackId="a"
                            name="Hoàn thành"
                            fill="#22c55e"
                        />
                        <Bar
                            dataKey="successful"
                            stackId="a"
                            name="Thành công"
                            fill="#3b82f6"
                        />
                        <Bar
                            dataKey="failed"
                            stackId="a"
                            name="Thất bại"
                            fill="#f97316"
                        />
                        <Bar
                            dataKey="cancelled"
                            stackId="a"
                            name="Đã hủy"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Statisical;
