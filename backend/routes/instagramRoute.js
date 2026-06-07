import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import {
  reqUsersAccountList,
  getUsersAccountList,
  createPost,
  getInstagramFeed,
  getInstagramPostComments
} from "../controllers/instagramController.js";

const router = express.Router()
router.get("/request_accounts", isAuthenticated, reqUsersAccountList);
router.get("/page_list", isAuthenticated, getUsersAccountList);
router.post("/create_post", isAuthenticated, createPost);
router.get("/feed", isAuthenticated, getInstagramFeed);
router.post("/comments/:mediaId", isAuthenticated, getInstagramPostComments);
export default router
