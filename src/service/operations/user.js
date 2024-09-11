import Swal from "sweetalert2";
import { apiConnector } from "../apiConnector";
import { userEndpoints } from "../apis";
import { toast } from "react-hot-toast";
import { setLoading, setToken } from "../../slices/authSlice";
import { setSessionID, setUser } from "../../slices/profileSlice";
import socket from "../../socket io/socket";


const { 
  IMAGE_UPLOAD, 
  FODLER_IMAGE_UPLOAD,
   LOGIN_API, 
   FETCH_PROFILE ,
   LOGOUT_API,
   ALL_SESSION_API,
  } = userEndpoints;

export const imageUpload = async (data, token) => {
  let result = [];
  console.log(data);
  const toastId = toast.loading("Loading...");
  try {
    const formData = new FormData();
    for (let i = 0; i < data.length; i++) {
      formData.append("thumbnail", data[i]);
    }
    const response = await apiConnector("POST", IMAGE_UPLOAD, formData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });
    // console.log("CREATE IMAGE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Add IMAGE Details");
    }
    toast.success("IMAGE Details Added Successfully");
    result = response?.data?.images;
  } catch (error) {
    console.log("CREATE IMAGE API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const uploadImageToFolder = async (data, token) => {
  console.log(data);
  const toastId = toast.loading("Uploading images...");

  try {
    const response = await apiConnector("POST", FODLER_IMAGE_UPLOAD, data, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    console.log("UPLOAD IMAGE API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not upload images");
    }

    toast.success("Images uploaded successfully");
  } catch (error) {
    console.log("UPLOAD IMAGE API ERROR............", error);
    toast.error(error.message);
  }

  toast.dismiss(toastId);
};

export async function login(email, password, navigate, dispatch) {
  Swal.fire({
    title: "Loading",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await apiConnector("POST", LOGIN_API, {
      email,
      password,
    });

    Swal.close();
    if (!response?.data?.success) {
      await Swal.fire({
        title: "Login Failed",
        text: response.data.message,
        icon: "error",
      });
      throw new Error(response.data.message);
    }

    Swal.fire({
      title: `Login Successfully!`,
      text: `Have a nice day!`,
      icon: "success",
    });

    console.log(response?.data);
    dispatch(setToken(response?.data?.token));
    dispatch(setUser(response.data.user));
    dispatch(setSessionID(response?.data?.sessionId))

    localStorage.setItem("token", JSON.stringify(response?.data?.token));
    localStorage.setItem("user", JSON.stringify(response?.data?.user));
    localStorage.setItem("sessionID", JSON.stringify(response?.data?.sessionId))

    // Emit login event to Socket.IO server
    socket.emit('user-login', { 
      sessionId: response.data.sessionId, 
      user: response.data.user 
    });

    // Optionally navigate to another page
    navigate("/admin/dashboard");

  } catch (error) {
    console.log("LOGIN API ERROR............", error);
    Swal.fire({
      title: "Login Failed",
      text:
        error.response?.data?.message ||
        "Something went wrong, please try again later",
      icon: "error",
    });
  }
}


export function fetchMyProfile(token, navigate,sessionId) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("GET", FETCH_PROFILE, null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Session-ID': sessionId,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message);
      }

      dispatch(setUser(response?.data?.user));
      localStorage.setItem("user", JSON.stringify(response?.data?.user));
    } catch (error) {
      console.log("LOGIN API ERROR............", error?.response?.data?.message);
console.log(error)
      if (error?.response?.data?.message === 'Token expired' || error?.response?.data?.message === 'token is invalid'|| error?.response?.data?.message === "Session ID required." ||error?.response?.data?.message === "Invalid session" ) {
        Swal.fire({
          title: "Session Expired",
          text: "Please log in again for security purposes.",
          icon: "warning",
          confirmButtonText: "Login",
        }).then(() => {
          dispatch(setToken(null))
          dispatch(setUser(null))
          dispatch(setSessionID(null))
      
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          toast.success("Logged Out")
          navigate("/")
    
        
        });
      }
    }
    dispatch(setLoading(false));
  };
}




export const getSessions = async (token,sessionId) => {
  const toastId = toast.loading("Fetching sessions...");

  try {
    const response = await apiConnector("GET", ALL_SESSION_API, null, {
      Authorization: `Bearer ${token}`,
      'Session-ID': sessionId,

    });

    if (!response?.data?.success) {
      throw new Error("Could not fetch sessions");
    }

    toast.success("Sessions fetched successfully");
  toast.dismiss(toastId);

    return response.data.sessions; // Assuming 'sessions' is the correct key in the response
  } catch (error) {
    console.error("Fetch Sessions API ERROR:", error);
    toast.error(`Error: ${error.message}`);
  }

  toast.dismiss(toastId);
  return [];
};

export const logoutSession = async (token, sessionId) => {
  const toastId = toast.loading("Logging out...");
console.log(sessionId)
  try {
    const response = await apiConnector("POST", LOGOUT_API, { sessionId }, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'Session-ID': sessionId,

    });

    if (!response?.data?.success) {
      throw new Error("Could not log out the session");
    }
  toast.dismiss(toastId);

    return true;
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout API ERROR:", error);
    toast.error(`Error: ${error.message}`);
  }

  toast.dismiss(toastId);
  return false;

};


export function logout(token,sessionId,navigate) {
  return async(dispatch) => {

const res = await  logoutSession(token,sessionId)
if(res){
  dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(setSessionID(null))

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
}
  
  }
}