const formData = new FormData();

formData.append("email", email);
formData.append("phone_number", phone);
formData.append("password", password);
formData.append("role", "seller");

formData.append("shop_name", shopName);
formData.append("shop_address", shopAddress);
formData.append("gst_number", gstNumber);

if (idProof) {
    formData.append("id_proof", idProof);
}

await api.post("/accounts/seller-register/", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});