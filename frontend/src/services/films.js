import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";

const API_URL = `/api/film`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const categoryFilms = [
    "Tâm Lý ",
    "Tình Cảm",
    "Chính Kịch",
    "Hành Động",
    "Tài Liệu",
    "Phiêu Lưu",
    "Hình Sự",
    "Tội Phạm",
    "Kinh Dị",
    "Hoạt Hình",
    "Hài Hước",
    "Khoa Học Viễn Tưởng",
];

export const useAllFilms = () => {
    const endpoint = `${API_URL}/get-all`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    const mutateFilms = () => mutate(endpoint);
    return {
        films: data?.data,
        isLoadingAllFimls: isLoading,
        isErrorAllFimls: error,
        mutateFilms,
    };
};

export const useFilmsByCurrentYear = () => {
    const endpoint = `${API_URL}/get-films-by-current-year`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    const mutateFilmsByCurrentYear = () => mutate(endpoint);
    return {
        filmsCurrentyear: data?.data,
        isLoadingFilmsByCurrentYear: isLoading,
        isErrorFilmsByCurrentYear: error,
        mutateFilmsByCurrentYear,
    };
};

export const useFilmsByCategory = (category) => {
    const shouldFetch = category?.trim(); // kiểm tra category không rỗng và không chỉ chứa khoảng trắng

    const endpoint = shouldFetch
        ? `${API_URL}/get-film-by-category?name=${encodeURIComponent(category)}`
        : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        film: data?.data,
        isLoading,
        error,
    };
};

export const useFilmsByYear = (year) => {
    const shouldFetch = year?.trim(); // kiểm tra year không rỗng và không chỉ chứa khoảng trắng

    const endpoint = shouldFetch
        ? `${API_URL}/get-film-by-year?release_date=${encodeURIComponent(year)}`
        : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        film: data?.data,
        isLoading,
        error,
    };
};

export const useTop10Film = () => {
    const endpoint = `${API_URL}/get-top10-film`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        film: data?.data,
        isLoading,
        error,
    };
};

export const createFilm = async (formData) => {
    try {
        const res = await axiosInstance.post(
            `${API_URL}/create-film`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data; // trả về response data để frontend xử lý
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi tạo film",
            }
        );
    }
};

export const useFilm = (_id) => {
    const shouldFetch = _id != null && _id !== "";
    const endpoint = shouldFetch ? `${API_URL}/get-film/${_id}` : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    const mutateFilm = () => mutate(endpoint);
    return {
        film: data?.data,
        isLoading,
        isError: error,
        mutateFilm,
    };
};

export const editFilmById = async (_id, formData) => {
    try {
        const res = await axiosInstance.put(
            `${API_URL}/edit-film/${_id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi chỉnh sửa film",
            }
        );
    }
};

export const deleteFilmById = async (_id) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/delete-film/${_id}`);
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa film",
            }
        );
    }
};
