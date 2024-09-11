const BASE_URL = process.env.REACT_APP_BASE_URL

// ??USER APIS
export const userEndpoints = {
    LOGIN_API : BASE_URL + "/user/login",
    FETCH_PROFILE : BASE_URL + "/user/fetchMyProfile",
    LOGOUT_API :BASE_URL + "/user/logout",
    ALL_SESSION_API :BASE_URL + "/user/getsession",



    FODLER_IMAGE_UPLOAD : BASE_URL + "/folder/photoUpload",
    IMAGE_UPLOAD : BASE_URL + "/image/multi",


    //folder
    CREATE_FOLDER_API : BASE_URL + "/folder/createFolder",
    GET_ALL_FOLDER_API : BASE_URL + "/folder/allFolder",
    GET_SINGLE_FOLDER_API : BASE_URL + "/folder/folderDetails",

  
}



