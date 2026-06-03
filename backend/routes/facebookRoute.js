import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import {
  reqUsersPageList,
  getUsersPageList,
  createPost
} from "../controllers/facebookController.js";


const router = express.Router()
router.get("/request_pages", isAuthenticated, reqUsersPageList);
router.get("/page_list", isAuthenticated, getUsersPageList);
router.post("/create_post", isAuthenticated, createPost);
export default router


