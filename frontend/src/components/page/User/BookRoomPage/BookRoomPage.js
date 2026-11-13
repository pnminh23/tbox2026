import style from "./BookRoomPage.module.scss";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light-border.css";
import { PATH } from "@/constants/config";
import { AiOutlineWarning } from "react-icons/ai";
import Link from "next/link";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Selection from "@/components/common/Selection";
import { useState } from "react";
import Calendar from "@/components/common/Calender";
import clsx from "clsx";
import Image from "next/image";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    },
);
import Feedback from "@/components/common/Feedback";
import { useBookingsRealtime } from "@/hooks/useBookingRealTime";
import { useRoomByBranchAndType, useTypeRoom } from "@/services/room";
import loadingAnimation from "@public/animations/loadingItem.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import { useAllBranches } from "@/services/branch";
import { useAllCombo } from "@/services/combo";
import { useAllTimeSlots } from "@/services/timeSlots";
import { useUserData } from "@/services/account";
import { createBooking } from "@/services/booking";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAllFilms, useFilm } from "@/services/films";
import Popup from "@/components/common/Popup/Popup";
import SearchBar from "@/components/common/SearchBar";
import { formatMoney } from "@/function/formatMoney";
import useBookingActions from "@/hooks/useBookingActions";
import { durationMinutes } from "@/function/duration";

const MIN_MINUTES = 60;
const PAYMENT_THRESHOLD = 150000; // đồng bộ với backend/src/services/booking.js
const GRACE_MINUTES = 10; // cho đặt khung giờ vừa bắt đầu tối đa 10 phút

const toOptions = (list = []) =>
    list.map((item) => ({ name: item.name, id: item._id }));

const BookRoomPage = () => {
    const router = useRouter();
    const { user } = useUserData();
    const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedTypeRoom, setSelectedTypeRoom] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [selectedCombo, setSelectedCombo] = useState("");
    const [selectedDiscount, setSelectedDiscount] = useState("");
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPopupConfirm, setIsPopupConfirm] = useState(false);
    const [contentConfirm, setContentConfirm] = useState("");
    const [messageDeposit, setMessageDeposit] = useState("");

    const day = dayjs(selectedDate).format("YYYY-MM-DD");
    const bookedRoom = useBookingsRealtime(selectedRoom, day);
    const { typeRooms } = useTypeRoom();
    const { branches } = useAllBranches();
    const { allCombo } = useAllCombo();
    const { timeSlots = [] } = useAllTimeSlots();
    const { films } = useAllFilms();
    const { RoomsByBranchAndType: rooms } = useRoomByBranchAndType(
        selectedBranch,
        selectedTypeRoom,
    );
    const { pay } = useBookingActions(booking);

    const filmId = selectedFilm || router.query.f_Id;
    const { film, isLoading: loadingFilm } = useFilm(filmId);
    const filmMinutes = durationMinutes(film?.duration);
    const room = rooms?.find((r) => r._id === selectedRoom);

    const FilmOptions = films?.map((f) => ({
        name: `${f.name} - ${f.nameEnglish}`,
        id: f._id,
        image: f.image,
    }));
    const TypeRoomOptions = toOptions(typeRooms);
    const BranchOptions = toOptions(branches);
    // Chỉ hiện combo áp dụng cho loại phòng đã chọn, kèm lựa chọn bỏ combo
    const ComboOptions = [
        { name: "Không dùng combo", id: "" },
        ...toOptions(
            allCombo?.filter((c) =>
                c.types.some((t) => t.typeRoom?._id === selectedTypeRoom),
            ),
        ),
    ];

    const customer = {
        name_client: user?.name || guest.name,
        email: user?.email || guest.email,
        phone: user?.phone || guest.phone,
    };

    /* ---------- Khung giờ ---------- */

    const bookedIds = new Set((bookedRoom?.bookedTimeSlots || []).map(String));
    const isPast = (slot) => {
        const [h, m] = slot.start_time.split(":").map(Number);
        return dayjs(selectedDate)
            .hour(h)
            .minute(m)
            .isBefore(dayjs().subtract(GRACE_MINUTES, "minute"));
    };
    const isUnavailable = (slot) => bookedIds.has(slot._id) || isPast(slot);

    const selectedSlots = timeSlots.filter((slot) =>
        selectedTimeSlots.includes(slot._id),
    );
    const totalMinutes = selectedSlots.reduce(
        (sum, slot) => sum + (slot.slot_duration || 0),
        0,
    );

    // Đổi ngày/cơ sở/loại phòng/phòng thì bỏ khung giờ đã chọn
    const resetSlots = () => setSelectedTimeSlots([]);
    const handleDateChange = (date) => (setSelectedDate(date), resetSlots());
    const handleBranchChange = (id) => (
        setSelectedBranch(id),
        setSelectedRoom(""),
        resetSlots()
    );
    const handleTypeRoomChange = (id) => (
        setSelectedTypeRoom(id),
        setSelectedRoom(""),
        setSelectedCombo(""),
        resetSlots()
    );
    const handleSelectedRoom = (id) => (setSelectedRoom(id), resetSlots());

    // Chọn dải khung giờ liên tiếp [from, to]; trả null nếu có khung không dùng được
    const rangeIds = (from, to) => {
        const range = timeSlots.slice(
            Math.min(from, to),
            Math.max(from, to) + 1,
        );
        return range.some(isUnavailable) ? null : range.map((slot) => slot._id);
    };

    const handleTimeSlotClick = (slotId) => {
        const clicked = timeSlots.findIndex((slot) => slot._id === slotId);
        if (clicked === -1) return;

        // Đã có khung đầu: chọn từ khung đầu tới khung vừa bấm
        if (selectedTimeSlots.length) {
            const first = timeSlots.findIndex(
                (slot) => slot._id === selectedTimeSlots[0],
            );
            const ids = rangeIds(first, clicked);
            return ids
                ? setSelectedTimeSlots(ids)
                : toast.error(
                      "Khoảng giờ này có khung đã được đặt hoặc đã qua.",
                  );
        }

        // Lần đầu: tự chọn đủ thời lượng phim (tối thiểu 60 phút)
        const need = Math.max(filmMinutes, MIN_MINUTES);
        let end = clicked;
        let minutes = timeSlots[clicked].slot_duration;
        while (minutes < need && end + 1 < timeSlots.length)
            minutes += timeSlots[++end].slot_duration;

        const ids = minutes >= need && rangeIds(clicked, end);
        if (!ids)
            return toast.error(
                `Không đủ ${need} phút trống liên tiếp từ khung giờ này.`,
            );
        setSelectedTimeSlots(ids);
    };

    /* ---------- Giá tạm tính (chưa gồm mã giảm giá; server tính lại khi đặt) ---------- */

    const combo = allCombo?.find((c) => c._id === selectedCombo);
    const estimate = !room
        ? 0
        : combo
          ? combo.types.find((t) => t.typeRoom?._id === room.type?._id)
                ?.price || 0
          : (room.type?.base_price_per_minute || 0) * totalMinutes;

    /* ---------- Đặt phòng ---------- */

    const validate = () => {
        if (!filmId) return "Vui lòng chọn phim";
        if (!selectedBranch) return "Vui lòng chọn cơ sở";
        if (!selectedTypeRoom) return "Vui lòng chọn loại phòng";
        if (!selectedRoom) return "Vui lòng chọn phòng";
        if (!customer.name_client) return "Vui lòng cung cấp họ và tên";
        if (!customer.email) return "Vui lòng cung cấp email";
        if (!customer.phone) return "Vui lòng cung cấp số điện thoại";
        if (!selectedTimeSlots.length) return "Vui lòng chọn khung giờ";
        if (totalMinutes < MIN_MINUTES)
            return `Đặt phòng tối thiểu ${MIN_MINUTES} phút`;
        return "";
    };
    const errorMessage = validate();

    const handleBooking = () => {
        if (errorMessage) return toast.error(errorMessage);
        if (filmMinutes && Math.abs(totalMinutes - filmMinutes) > 30) {
            setContentConfirm(
                `Phim bạn chọn dài ${filmMinutes} phút nhưng bạn đang đặt ${totalMinutes} phút. Bạn có chắc muốn tiếp tục?`,
            );
            return setIsPopupConfirm(true);
        }
        handleBookingFinal();
    };

    const handleBookingFinal = async () => {
        setIsPopupConfirm(false);
        setLoading(true);
        const result = await createBooking({
            ...customer,
            film: film?._id,
            room: selectedRoom,
            date: day,
            combo: selectedCombo,
            time_slots: selectedTimeSlots,
            promotion: selectedDiscount.trim(),
        });
        setLoading(false);

        if (!result.success) return toast.error(result.message);
        const newBooking = result.data.data;
        setBooking(newBooking);
        resetSlots();

        if (result.data.paymentRequired)
            return setMessageDeposit(result.message);
        toast.success(result.message);
        router.push(`/bookRoom/${newBooking.id_booking}`);
    };

    return (
        <div className="container">
            {loading && <DynamicLoadingFullPage />}
            {isPopupConfirm && (
                <Popup
                    handleClose={() => {
                        setIsPopupConfirm(false);
                    }}>
                    <div className={style.formConfirm}>
                        <p className={style.titleConfirm}>Xác nhận đặt phòng</p>
                        <p className={style.contentConfirm}>{contentConfirm}</p>
                        <div className={style.row}>
                            <Button
                                type={"button"}
                                rounded_10
                                red
                                onClick={() => setIsPopupConfirm(false)}>
                                Hủy
                            </Button>
                            <Button
                                type={"button"}
                                rounded_10
                                yellowLinear
                                onClick={() => {
                                    setConfirmedOverDuration(true);
                                    handleBookingFinal();
                                }}>
                                Vẫn tiếp tục
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
            {messageDeposit && (
                <Popup handleClose={() => setMessageDeposit("")}>
                    <div className={style.formConfirm}>
                        <p className={style.titleConfirm}>Yêu cầu cọc trước</p>
                        <p className={style.contentConfirm}>{messageDeposit}</p>
                        <div className={style.row}>
                            <Button
                                type={"button"}
                                rounded_10
                                red
                                onClick={() => pay("deposit")}>
                                Thanh toán 50%
                            </Button>
                            <Button
                                type={"button"}
                                rounded_10
                                yellowLinear
                                onClick={() => pay("full")}>
                                Thanh toán 100%
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            <div className={style.container}>
                <div className={style.fromInfor}>
                    {user ? (
                        <div className={style.welcome}>
                            <p
                                className={
                                    style.username
                                }>{`Hi ${user.name}`}</p>
                            <p className={style.title}>
                                Hãy đặt phòng để trải nghiệm dịch vụ của PNM -
                                BOX
                            </p>
                            <p className={style.title}>
                                Chúng tôi sẽ không để bạn thất vọng
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={style.login}>
                                Bạn đã có tài khoản?
                                <Link href={PATH.Login}>Đăng nhập tại đây</Link>
                            </div>
                            <div className={style.infor}>
                                <Input
                                    rounded_10
                                    color_black
                                    placeholder={"Họ và tên"}
                                    onChange={(e) =>
                                        setGuest((g) => ({
                                            ...g,
                                            name: e.target.value,
                                        }))
                                    }
                                    value={guest.name}
                                />

                                <Input
                                    rounded_10
                                    color_black
                                    placeholder="Email"
                                    onChange={(e) =>
                                        setGuest((g) => ({
                                            ...g,
                                            email: e.target.value,
                                        }))
                                    }
                                    value={guest.email}
                                />

                                <Input
                                    rounded_10
                                    color_black
                                    placeholder="Số điện thoại"
                                    onChange={(e) =>
                                        setGuest((g) => ({
                                            ...g,
                                            phone: e.target.value,
                                        }))
                                    }
                                    value={guest.phone}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className={style.formBookRoom}>
                    <div className={style.form}>
                        <div className={style.groupItems}>
                            <p>Chọn phim</p>
                            <SearchBar
                                data={FilmOptions}
                                onSelect={(item) => {
                                    setSelectedFilm(item.id);
                                }}
                                heightImage={70}
                                widthImage={50}
                            />
                        </div>
                        <div className={style.groupItems}>
                            {loadingFilm ? (
                                <Lottie
                                    animationData={loadingAnimation}
                                    loop={true}
                                    autoplay={true}
                                    className={style.loading}
                                />
                            ) : (
                                film && (
                                    <div className={style.groupItems}>
                                        <p>Phim bạn chọn</p>
                                        <div className={style.filmItem}>
                                            <div className={style.filmImage}>
                                                <Image
                                                    src={film.image}
                                                    alt="film image"
                                                    width={200}
                                                    height={300}
                                                    style={{
                                                        objectFit: "cover",
                                                    }} // dùng style thay vì objectFit props
                                                />
                                            </div>
                                            <div className={style.filmContent}>
                                                <p className={style.filmName}>
                                                    {film.name}
                                                </p>
                                                <p className={style.subName}>
                                                    {film.nameEnglish}
                                                </p>
                                                <p
                                                    className={
                                                        style.release_date
                                                    }>
                                                    {`Năm phát hành:\u2003${film.release_date}`}
                                                </p>
                                                <p
                                                    className={
                                                        style.duration
                                                    }>{`Thời lượng:\u2003${film.duration}`}</p>
                                                <p
                                                    className={
                                                        style.country
                                                    }>{`Quốc gia:\u2003${film.country}`}</p>
                                                <div
                                                    className={
                                                        style.Listcategory
                                                    }>
                                                    {`Thể loại:\u2003`}
                                                    {film.category.map(
                                                        (item, index) => (
                                                            <div
                                                                key={index}
                                                                className={
                                                                    style.category
                                                                }>
                                                                {item}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                        {filmId && (
                            <div className={style.groupItems}>
                                <p>Chọn cơ sở bạn muốn đến</p>
                                <Selection
                                    options={BranchOptions}
                                    optionLabel="name"
                                    defaultValue={selectedBranch}
                                    optionValue="id"
                                    onChange={handleBranchChange}
                                />
                            </div>
                        )}

                        {selectedBranch && (
                            <div className={clsx(style.groupItems, style.row)}>
                                <div className={style.date}>
                                    <p>Ngày đặt phòng</p>

                                    <Calendar
                                        selectedDate={selectedDate}
                                        onChange={handleDateChange}
                                        currentDay
                                        disablePastDates
                                    />
                                </div>

                                <div className={style.room}>
                                    <p>Chọn loại phòng</p>
                                    <Selection
                                        options={TypeRoomOptions}
                                        defaultValue={selectedTypeRoom}
                                        optionLabel="name"
                                        optionValue="id"
                                        onChange={handleTypeRoomChange}
                                    />
                                </div>
                            </div>
                        )}
                        <div className={clsx(style.groupItems, style.time)}>
                            {selectedTypeRoom && (
                                <div className={style.typeRoom}>
                                    {rooms?.map((room) => (
                                        <div
                                            className={clsx(
                                                style.room,
                                                selectedRoom === room._id
                                                    ? style.active
                                                    : "",
                                            )}
                                            key={room._id}
                                            onClick={() =>
                                                handleSelectedRoom(room._id)
                                            }>
                                            <Image
                                                src={room?.image}
                                                alt={room.name}
                                                width={100}
                                                height={120}
                                            />

                                            {room.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedRoom && (
                                <div className={style.timeFrame}>
                                    {timeSlots.map((time) => {
                                        const past = isPast(time);
                                        const isDisabled = isUnavailable(time);

                                        const slotContent = (
                                            <div
                                                key={time._id}
                                                className={clsx(
                                                    style.slot,
                                                    selectedTimeSlots.includes(
                                                        time._id,
                                                    ) && style.activeSlot,
                                                    isDisabled && style.disable,
                                                )}
                                                onClick={() => {
                                                    if (!isDisabled)
                                                        handleTimeSlotClick(
                                                            time._id,
                                                        );
                                                }}>
                                                {`${time.start_time} - ${time.end_time}`}
                                            </div>
                                        );

                                        return isDisabled ? (
                                            <Tippy
                                                content={
                                                    past
                                                        ? "Khung giờ đã qua"
                                                        : "Khung giờ này đã được đặt"
                                                }
                                                key={time._id}
                                                placement="bottom"
                                                theme="light-border">
                                                <span>{slotContent}</span>
                                            </Tippy>
                                        ) : (
                                            slotContent
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedTimeSlots.length > 0 && (
                            <div className={style.row}>
                                <div className={style.groupItems}>
                                    <p>Chọn Combo</p>

                                    <Selection
                                        options={ComboOptions}
                                        defaultValue={selectedCombo}
                                        onChange={setSelectedCombo}
                                    />
                                </div>
                                <div className={style.groupItems}>
                                    <p>Mã giảm giá</p>
                                    <Input
                                        rounded_10
                                        placeholder={"Nhập mã giảm giá"}
                                        onChange={(e) =>
                                            setSelectedDiscount(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {estimate > 0 && (
                            <div className={style.groupItems}>
                                <p>
                                    {`Tạm tính: ${formatMoney(estimate)} (${totalMinutes} phút${
                                        selectedDiscount
                                            ? ", chưa trừ mã giảm giá"
                                            : ""
                                    })`}
                                </p>
                                {estimate > PAYMENT_THRESHOLD && (
                                    <p>{`Cần cọc tối thiểu ${formatMoney(Math.ceil(estimate / 2))} để giữ chỗ`}</p>
                                )}
                            </div>
                        )}

                        <Tippy
                            content={errorMessage}
                            placement="bottom"
                            theme="light"
                            disabled={!errorMessage}>
                            <div className={style.groupItems}>
                                <Button
                                    rounded_10
                                    redLinear
                                    onClick={handleBooking}
                                    disabled={!!errorMessage}>
                                    Đặt phòng
                                </Button>
                            </div>
                        </Tippy>
                        <div className={clsx(style.groupItems, style.warning)}>
                            <div className={style.title}>
                                <AiOutlineWarning />
                                <h5>Lưu ý</h5>
                            </div>
                            <p>
                                - Các đơn đặt phòng trên 150.000 VNĐ vui lòng
                                thanh toán trước 50% giá trị hóa đơn
                            </p>
                            <p>
                                - Những tài khoản đặt phòng nhưng không đến và
                                không báo lại cho PNM - BOX, chúng tôi xin phép
                                khóa tài khoản.
                            </p>
                            <p>
                                - PNM - BOX chỉ nhận đặt phòng qua website và
                                fanpage facebook, chúng tôi không chịu trách
                                nhiệm với những đơn đặt hằng qua nền tảng khác.
                            </p>
                        </div>
                    </div>
                    <Feedback />
                </div>
            </div>
        </div>
    );
};
export default BookRoomPage;
