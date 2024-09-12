// Import the required modules
const express = require("express")
const router = express.Router()

const{
    login,
    signup,
    fetchMyProfile,
    logoutSession,
    getSessions,
    getCurrentUser
} = require("../controllers/user")
const{
    auth,
     isUser,
     verifySession
}= require("../middlewares/auth")

router.post("/signup", signup)

router.post("/login", login)

router.get("/fetchMyProfile",auth,verifySession,fetchMyProfile )
router.post('/logout', auth,verifySession, logoutSession);
router.get('/getsession', auth,verifySession, getSessions);
router.get("/me", auth, getCurrentUser);
module.exports = router
