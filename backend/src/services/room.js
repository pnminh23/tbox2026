import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";

const API_URL = `/api/room`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const useRoomByBranchAndType = (branchId, typeRoomId) => {
    const endpoint =
        branchId && typeRoomId
            ? `${API_URL}/get-room/${branchId}/${typeRoomId}`
            : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });
    const mutateRoom = () => mutate(endpoint);
    return {
        RoomsByBranchAndType: data?.data,
        isLoadingAllRooms: isLoading,
        isErrorAllRooms: error,
        mutateRoom,
    };
};

export const useRoomByBranch = (branchId) => {
    const endpoint = `${API_URL}/get-room-branch/${branchId}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        roomsByBranch: data?.data,
        isLoading,
        isError: error,
    };
};

export const createRoom = async (formData) => {
    try {
        const res = await axiosInstance.post(
            `${API_URL}/create-room`,
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
                message: "Đã xảy ra lỗi khi tạo phòng",
            }
        );
    }
};

export const editRoomById = async (_id, formData) => {
    try {
        const res = await axiosInstance.put(
            `${API_URL}/edit-room/${_id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        const messageFromServer =
            res.data?.message || res.statusText || "Yêu cầu thành công.";
        return {
            success: true,
            message: messageFromServer,
        };
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi chỉnh sửa phòng",
            }
        );
    }
};

export const useTypeRoom = () => {
    const endpoint = `${API_URL}/get-all-roomType/`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    return {
        typeRooms: data?.data,
        isLoading,
        isError: error,
    };
};

export const deleteRoomById = async (_id) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/delete-room/${_id}`);
        return res.data;
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa combo",
            }
        );
    }
};

export const createRoomType = async (roomTypeData) => {
    try {
        const res = await axiosInstance.post(
            `${API_URL}/create-roomType`,
            roomTypeData
        );
        return res.data;
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message:
                    "Đã xảy ra lỗi khi tạo loại phòng mới. Vui lòng thử lại.",
            }
        );
    }
};

// Hook để lấy tất cả loại phòng
export const useAllTypeRooms = () => {
    const endpoint = `${API_URL}/get-all-roomType`; // Giả sử đây là API endpoint của bạn
    const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

    return {
        typeRooms: data?.data,
        isLoading,
        isError: error,
        mutateTypeRooms: mutate,
    };
};

export const editRoomTypeById = async (_id, roomTypeData) => {
    try {
        const res = await axiosInstance.put(
            `${API_URL}/edit-type-room/${_id}`,
            roomTypeData
        );
        const messageFromServer =
            res.data?.message || "Cập nhật loại phòng thành công.";
        return res.data;
    } catch (err) {
        console.error(`Error editing room type with ID ${_id}:`, err);
        throw (
            err.response?.data || {
                success: false,
                message:
                    "Đã xảy ra lỗi khi chỉnh sửa loại phòng. Vui lòng thử lại.",
            }
        );
    }
};

export const deleteRoomTypeById = async (_id) => {
    try {
        const res = await axiosInstance.delete(
            `${API_URL}/delete-roomType/${_id}`
        );
        const messageFromServer =
            res.data?.message || "Xóa loại phòng thành công.";
        return {
            success: true,
            message: messageFromServer,
        };
    } catch (err) {
        console.error(`Error deleting room type with ID ${_id}:`, err);
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa loại phòng. Vui lòng thử lại.",
            }
        );
    }
};
