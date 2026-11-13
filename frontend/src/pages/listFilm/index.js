import PageHead from "@/components/common/PageHead/PageHead";
import LayoutUser from "@/layout/LayoutUser/LayoutUser";
import ListFilmPage from "@/components/page/User/ListFilmPage";
export default function ListFilm() {
    return (
        <>
            <PageHead title="Danh sách phim" />
            <ListFilmPage />
        </>
    );
}
ListFilm.getLayout = function getLayout(page) {
    return <LayoutUser>{page}</LayoutUser>;
};
