import api from "../api/axios";

export const loginUser = async (data) => {
    const response = await api.post("/accounts/login/", data);
    return response.data;
};

export const checkPhone = async (data) => {
    const response = await api.post("/accounts/check-phone/", data);
    return response.data;
};

export const sendOTP = async (data) => {
    const response = await api.post("/accounts/send-otp/", data);
    return response.data;
};

export const verifyOTP = async (data) => {
    const response = await api.post("/accounts/verify-otp/", data);
    return response.data;
};