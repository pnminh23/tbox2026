import PageHead from '@/components/common/PageHead/PageHead';
import LayoutUser from '@/layout/LayoutUser/LayoutUser';
import LocationsPage from '@/components/page/User/LocationsPage';
export default function Locations() {
    return (
        <>
            <PageHead title="Hệ thống cơ sở" />
            <LocationsPage />
        </>
    );
}
Locations.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
