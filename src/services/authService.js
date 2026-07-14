import api from "../api/axios"; // Adjust the path if needed

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/accounts/login/",
    credentials
  );

  return response.data;
};