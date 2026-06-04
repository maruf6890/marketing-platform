import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import {
  reqUsersAccountList,
  getUsersAccountList,
  createPost
} from "../controllers/instagramController.js";

const router = express.Router()
router.get("/request_accounts", isAuthenticated, reqUsersAccountList);
router.get("/page_list", isAuthenticated, getUsersAccountList);
router.post("/create_post", isAuthenticated, createPost);
export default router
