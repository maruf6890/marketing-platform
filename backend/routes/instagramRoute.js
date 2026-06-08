import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import {
  reqUsersAccountList,
  getUsersAccountList,
  createPost,
  getInstagramFeed,
  getPostComments,
  editPost,
  publishScheduledOrDraftPost,
} from "../controllers/instagramController.js";

const router = express.Router()
router.get("/request_accounts", isAuthenticated, reqUsersAccountList);
router.get("/page_list", isAuthenticated, getUsersAccountList);
router.post("/create_post", isAuthenticated, createPost);
router.put("/edit_post/:postId", isAuthenticated, editPost);
router.post("/publish_post", isAuthenticated, publishScheduledOrDraftPost);
router.get("/feed", isAuthenticated, getInstagramFeed);
router.post("/comments/:mediaId", isAuthenticated, getPostComments);
export default router
