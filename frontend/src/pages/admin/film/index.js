import PageHead from '@/components/common/PageHead/PageHead';
import LayoutAdmin from '@/layout/LayoutAdmin/LayoutAdmin';
import FilmManage from '@/components/page/Admin/FilmManage/FilmManage';

const title = 'Quản lý danh sách phim';
export default function Account() {
    return (
        <>
            <PageHead title={title} />
            <FilmManage />
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
