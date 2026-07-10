import api from "../api/axios";

export const loginUser = async (data) => {
    const response = await api.post(
        "accounts/login/",
        data
    );

    return response.data;
};

export const userRegister = async (data) => {
    const response = await api.post(
        "/accounts/user-register/",
        data
    );

    return response.data;
};