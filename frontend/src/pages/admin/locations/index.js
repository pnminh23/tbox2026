import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import LocationManage from '@/components/page/Admin/LocationManage/LocationManage';

const title = 'Quản lý cơ sở PNM - BOX';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <LocationManage />
        </>
    );
}
Account.getLayout = function getLayout(page) {
    return (
        <LayoutAdmin admin title={title}>
            {page}
        </LayoutAdmin>
    );
};
