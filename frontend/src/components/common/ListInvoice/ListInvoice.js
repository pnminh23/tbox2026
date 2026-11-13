import clsx from "clsx";
import style from "./ListInvoice.module.scss";
import Button from "../Button";
import {
    AiOutlineCheckCircle,
    AiOutlineCloseCircle,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlinePayCircle,
} from "react-icons/ai";
import RoomDisplay from "../RoomDisplay/RoomDisplay";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Popup from "../Popup/Popup";
import Input from "../Input";
import { toast } from "react-toastify";
import dynamic from "next/dynamic"; // <-- Cần import này

// Thay thế dòng:
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Bằng Dynamic Import:
const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Vẫn là key để tránh lỗi document is not defined
        loading: () => null,
    }
);
import { createFeedback } from "@/services/feedback";
import { formatMoney } from "@/function/formatMoney";
import { createPayment } from "@/services/payment";
import { useRouter } from "next/router";
import { editBooking } from "@/services/booking";

const ListInvoice = ({ booking }) => {
    const [loading, setLoading] = useState(false);
    const email = localStorage.getItem("email");
    const [feedback, setFeedback] = useState("");
    const [isPopupFeedback, setIsPopUpFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const totalStars = 5;
    const [isPopupPaymentStatus, setIsPopupPaymentStatus] = useState(false);
    const router = useRouter();
    const { status } = router.query;

    useEffect(() => {
        if (status) {
            setIsPopupPaymentStatus(true);
            const newPath = router.pathname;
            router.replace(newPath, newPath, { shallow: true });
        }
    }, [status, router]);

    const handleFeedback = async () => {
        setLoading(true);
        if (!booking?.room?.branch?._id || !booking?._id) {
            toast.error("Thông tin booking không đầy đủ để gửi đánh giá.");
            setLoading(false);
            return;
        }

        const newFeedback = {
            email,
            branch: booking.room.branch._id,
            bookingId: booking._id,
            rating: feedbackRating,
            comment: feedback,
        };

        try {
            const result = await createFeedback(newFeedback);
            if (result.success) {
                toast.success(result.message);
                setIsPopUpFeedback(false);
                setFeedbackRating(0);
                setHoverRating(0);
                setFeedback("");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Có lỗi xảy ra khi gửi đánh giá.");
        } finally {
            setLoading(false);
        }
    };

    const handleStarClick = (value) => setFeedbackRating(value);
    const handleStarMouseEnter = (value) => setHoverRating(value);
    const handleStarMouseLeave = () => setHoverRating(0);
    const handleFeedbackTextChange = (e) => setFeedback(e.target.value);

    if (!booking) {
        return (
            <div className={style.listInvoiceItem}>
                <p>Thông tin đơn đặt chỗ không có sẵn.</p>
            </div>
        );
    }

    const handlePayment = async () => {
        const description = `${booking?.id_booking}`;
        const expiredAt = dayjs().add(5, "minute").unix();
        const newPayment = {
            id_booking: booking?.id_booking,
            email,
            amount: booking?.payment_amount || 0,
            description,
            returnUrl: `http://localhost:3000/bookRoom/${booking?.id_booking}`,
            cancelUrl: `http://localhost:3000/bookRoom/${booking?.id_booking}`,
            expiredAt,
        };

        try {
            const result = await createPayment(newPayment);
            if (result?.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                alert("Không lấy được link thanh toán!");
            }
        } catch {
            alert("Có lỗi xảy ra khi khởi tạo thanh toán!");
        }
    };

    const handleCancelBooking = async () => {
        if (!booking) return;
        if (
            !window.confirm(
                `Bạn có chắc muốn hủy đơn hàng "${booking._id}" không?`
            )
        )
            return;

        try {
            const result = await editBooking(booking._id, { status: "ĐÃ HỦY" });
            if (result.success) {
                toast.success("Đã hủy đơn đặt phòng thành công!");
            }
        } catch (error) {
            toast.error(error.message || "Có lỗi xảy ra khi hủy đơn.");
        }
    };

    return (
        <>
            {isPopupPaymentStatus && (
                <Popup handleClose={() => setIsPopupPaymentStatus(false)}>
                    <div className={style.popupPayment}>
                        {status === "PAID" ? (
                            <>
                                <AiOutlineCheckCircle
                                    className={style.success}
                                />
                                <p>Thanh toán thành công</p>
                                <p>Đơn hàng của bạn đã được cập nhật.</p>
                            </>
                        ) : (
                            <>
                                <AiOutlineCloseCircle
                                    className={style.cancel}
                                />
                                <p>Thanh toán thất bại</p>
                                <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                            </>
                        )}
                        <Button
                            rounded_10
                            yellowLinear
                            onClick={() => setIsPopupPaymentStatus(false)}
                            style={{ marginTop: "20px" }}>
                            Đóng
                        </Button>
                    </div>
                </Popup>
            )}

            {loading && <DynamicLoadingFullPage />}

            {isPopupFeedback && (
                <Popup
                    dark
                    handleClose={() => {
                        setIsPopUpFeedback(false);
                        setFeedbackRating(0);
                        setHoverRating(0);
                        setFeedback("");
                    }}>
                    <div className={style.formPopup}>
                        <div className={style.title}>Viết đánh giá</div>
                        <div className={style.groupItem}>
                            <label>Cơ sở</label>
                            <Input
                                rounded_10
                                outLine
                                value={
                                    booking?.room?.branch?.name ||
                                    "Không xác định"
                                }
                                readOnly
                            />
                        </div>
                        <div className={style.groupItem}>
                            <label>Đánh giá: </label>
                            <div className={style.stars}>
                                {[...Array(totalStars)].map((_, index) => {
                                    const starValue = index + 1;
                                    return (
                                        <span
                                            key={starValue}
                                            className={clsx(style.star, {
                                                [style.filled]:
                                                    starValue <=
                                                    (hoverRating ||
                                                        feedbackRating),
                                            })}
                                            onClick={() =>
                                                handleStarClick(starValue)
                                            }
                                            onMouseEnter={() =>
                                                handleStarMouseEnter(starValue)
                                            }
                                            onMouseLeave={handleStarMouseLeave}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === "Enter" ||
                                                    e.key === " "
                                                ) {
                                                    handleStarClick(starValue);
                                                }
                                            }}
                                            aria-label={`Đánh giá ${starValue} sao`}>
                                            ★
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={style.groupItem}>
                            <textarea
                                className={style.feedbackTextarea}
                                placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
                                rows="5"
                                value={feedback}
                                onChange={handleFeedbackTextChange}></textarea>
                        </div>
                        <Button
                            rounded_10
                            blue
                            w_fit
                            onClick={handleFeedback}
                            disabled={
                                feedbackRating === 0 ||
                                feedback.trim() === "" ||
                                feedback === "<p></p>"
                            }
                            className={style.btnAdd}>
                            Gửi đánh giá
                        </Button>
                    </div>
                </Popup>
            )}

            <div className={style.listInvoiceItem}>
                <div className={clsx(style.column, style.colRoom)}>
                    <RoomDisplay
                        roomName={booking?.room?.name}
                        roomType={booking?.room?.type?.name}
                    />
                </div>
                <div className={clsx(style.column, style.colInfor)}>
                    <div className={style.item}>
                        Mã đơn: <p>{booking?.id_booking || "N/A"}</p>
                    </div>
                    <div className={style.item}>
                        Số điện thoại: <p>{booking?.phone || "N/A"}</p>
                    </div>
                    <div className={style.item}>
                        Ngày:{" "}
                        <p>
                            {booking?.date
                                ? dayjs(booking.date).format("DD/MM/YYYY")
                                : "N/A"}
                        </p>
                    </div>
                </div>
                <div className={clsx(style.column, style.colInfor)}>
                    <div className={style.item}>
                        Cơ sở:{" "}
                        <p>{booking?.room?.branch?.name || "Không xác định"}</p>
                    </div>
                    <div className={style.item}>
                        Từ:{" "}
                        <p>{booking?.time_slots?.[0]?.start_time || "N/A"}</p>{" "}
                        đến:{" "}
                        <p>{booking?.time_slots?.at(-1)?.end_time || "N/A"}</p>
                    </div>
                    <div className={style.item}>
                        Combo: <p>{booking?.combo?.name || "Không có"}</p>
                    </div>
                </div>
                <div className={clsx(style.column, style.colIspay)}>
                    <p>{formatMoney(booking?.total_money)}</p>
                    <div className={style.item}>
                        Mã giảm giá: <p>{booking?.promotion || "Không"}</p>
                    </div>
                    <p>{booking?.isPay || "Chưa rõ"}</p>
                </div>
                <div className={clsx(style.column, style.colStatus)}>
                    Trạng thái <p>{booking?.status || "Chưa rõ"}</p>
                </div>
                <div className={clsx(style.colAction, style.column)}>
                    {booking?.isPay !== "ĐÃ THANH TOÁN" &&
                        booking?.status !== "THẤT BẠI" &&
                        booking?.status !== "ĐÃ HỦY" && (
                            <Button
                                rounded_10
                                blue
                                icon={<AiOutlinePayCircle />}
                                onClick={handlePayment}>
                                Thanh toán
                            </Button>
                        )}
                    {booking?.status === "HOÀN THÀNH" ? (
                        booking?.isReviewed ? (
                            <Button
                                rounded_10
                                yellowLinear
                                icon={<AiOutlineCheckCircle />}
                                disabled>
                                Bạn đã đánh giá
                            </Button>
                        ) : (
                            <Button
                                rounded_10
                                yellowLinear
                                icon={<AiOutlineEdit />}
                                onClick={() => setIsPopUpFeedback(true)}>
                                Đánh giá
                            </Button>
                        )
                    ) : (
                        booking?.status !== "ĐÃ HỦY" &&
                        booking?.status !== "THẤT BẠI" && (
                            <Button
                                rounded_10
                                red
                                icon={<AiOutlineDelete />}
                                onClick={handleCancelBooking}>
                                Hủy đơn
                            </Button>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default ListInvoice;
