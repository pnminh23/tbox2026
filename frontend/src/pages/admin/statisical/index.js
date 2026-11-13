import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import Statisical from '@/components/page/Admin/Statisical/Statisical';

const title = 'Thống kê';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <Statisical />
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
