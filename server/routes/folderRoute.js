const express = require("express")
const router = express.Router()

const{
    auth,
     isUser
}= require("../middlewares/auth")
const { 
    createFolder ,
    uploadPhoto, 
    getAllFolders,
    getSingleFolder
} = require("../controllers/folderCtrl")


router.post("/createFolder",auth,isUser,createFolder)
router.post("/photoUpload",auth,isUser,uploadPhoto)
router.get("/allFolder",auth,isUser,getAllFolders)
router.get("/folderDetails/:folderId",auth,isUser,getSingleFolder)


module.exports = router
