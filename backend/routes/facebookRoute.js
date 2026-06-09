import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { Logger } from "../middleware/logger.js";
import {
  reqUsersPageList,
  getUsersPageList,
  createPost,
  publishScheduledOrDraftPost,
  getDraftsPosts,
  getScheduledPosts,
  getFacebookFeed,
  getPostComments,
  editPost,
} from "../controllers/facebookController.js";


const router = express.Router()
router.get("/request_pages", isAuthenticated, Logger, reqUsersPageList);
router.get("/page_list", isAuthenticated, Logger, getUsersPageList);
router.post("/create_post", isAuthenticated, Logger, createPost);
router.put("/edit_post/:postId", isAuthenticated, Logger, editPost);
router.post("/publish_post", isAuthenticated, Logger, publishScheduledOrDraftPost);
router.get("/drafts", isAuthenticated, Logger, getDraftsPosts);
router.get("/scheduled_posts", isAuthenticated, Logger, getScheduledPosts);
router.get("/feed", isAuthenticated, Logger, getFacebookFeed);
router.post("/comments/:postId", isAuthenticated, Logger, getPostComments);
export default router


