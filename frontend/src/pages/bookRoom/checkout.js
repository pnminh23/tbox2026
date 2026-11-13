import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import Checkout from '@/components/page/User/Checkout';

export default function CheckoutPage() {
    return (
        <>
            <PageHead title="Xác nhận đặt phòng" />
            <Checkout />
        </>
    );
}

CheckoutPage.getLayout = (page) => <LayoutUser>{page}</LayoutUser>;
