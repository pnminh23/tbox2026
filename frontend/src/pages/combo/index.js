import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import ComboPage from '@/components/page/User/ComboPage';
export default function Combo() {
    return (
        <>
            <PageHead title="Combo" />
            <ComboPage />
        </>
    );
}
Combo.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
