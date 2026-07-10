import axios from "axios";


const API = axios.create({
    baseURL: "https://claywarebackend.onrender.com/api/"
});


export const loginUser = async (credentials)=>{

    const response = await API.post(
        "accounts/login/",
        credentials
    );


    return response.data;

};