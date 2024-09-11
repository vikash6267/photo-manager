import { apiConnector } from "../apiConnector";
import { userEndpoints } from "../apis";
import Swal from "sweetalert2";
const { 
  CREATE_FOLDER_API, 
  GET_ALL_FOLDER_API,
  GET_SINGLE_FOLDER_API
 } = userEndpoints;

export const getAllFolders = async (token) => {
  try {
    const response = await apiConnector("GET", GET_ALL_FOLDER_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Product");
    }
    const result = response?.data?.folders;
    console.log(response?.data);

    return result;
  } catch (error) {
    console.log("GET_ALL_FOLDER_API  ERROR:", error);

    return [];
  }
};

export const createFolder = async (data, token) => {
  console.log(data);

  // Show loading alert
  Swal.fire({
    title: "Creating folder...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", CREATE_FOLDER_API, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    console.log("CREATE FOLDER API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not create folder");
    }

    // Success alert
    Swal.fire({
      icon: "success",
      title: "Folder Created!",
      text: "Your folder has been created successfully.",
    });
  } catch (error) {
    console.log("CREATE FOLDER API ERROR............", error);

    // Error alert
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to create folder",
    });
  }
};

export const getFolder = async (id,token,page) => {
  try {
    const response = await apiConnector("GET", `${GET_SINGLE_FOLDER_API}/${id}`, null, {
      Authorization: `Bearer ${token}`,
    },
   {
      page: page, // Send the page number to the backend
    },
  );
    if (!response?.data?.success) {
      throw new Error("Could Not Fetch Product");
    }
    const result = response?.data;
    // console.log(response?.data?.images);

    return result;
  } catch (error) {
    console.log("GET_ALL_FOLDER_API  ERROR:", error);

    return [];
  }
};
