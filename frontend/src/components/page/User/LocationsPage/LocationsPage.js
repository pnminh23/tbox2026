import Banner from "@/components/common/Banner";
import style from "./LocationsPage.module.scss";
import Slider from "@/components/common/Slider";
import BoxItem from "@/components/common/ItemSlider/BoxItem";
import { useAllBranches } from "@/services/branch";
import { formatMoney } from "@/function/formatMoney";

const LocationsPage = () => {
    const { branches, isLoadingAllBranches } = useAllBranches();
    console.log("branches", branches);

    return (
        <>
            <Banner />
            <div className="container">
                {branches?.map((branch) => {
                    const roomImages = branch.rooms.map((room) => ({
                        image: room.image,
                        name: room.name,
                        type: {
                            name: room.type.name,
                            price: room.type.base_price_per_minute,
                        },
                    }));
                    return (
                        <Slider
                            key={branch._id}
                            data={roomImages}
                            subtitle={`Địa chỉ: ${branch.address}`}
                            isLoading={isLoadingAllBranches}
                            title={branch.name}
                            slidesPerView={3}
                            renderItem={(box) => <BoxItem box={box} />}
                            breakpoints={{
                                0: { slidesPerView: 2 },
                                480: { slidesPerView: 3 },
                                980: { slidesPerView: 3 },
                            }}>
                            <div className={style.priceContainer}>
                                {branch?.typeRoom?.map((type, index) => (
                                    <div
                                        className={style.priceItem}
                                        key={index}>
                                        <div
                                            className={
                                                style.typeName
                                            }>{`${type.name}`}</div>
                                        <p
                                            className={
                                                style.price
                                            }>{`${formatMoney(
                                            type.base_price_per_minute * 30
                                        )}/30 phút`}</p>
                                    </div>
                                ))}
                            </div>
                        </Slider>
                    );
                })}
            </div>
        </>
    );
};
export default LocationsPage;
