import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
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
  getPostAnalytics,
} from "../controllers/facebookController.js";


const router = express.Router()
router.get("/request_pages", isAuthenticated, reqUsersPageList);
router.get("/page_list", isAuthenticated, getUsersPageList);
router.post("/create_post", isAuthenticated, createPost);
router.put("/edit_post/:postId", isAuthenticated, editPost);
router.post("/publish_post", isAuthenticated, publishScheduledOrDraftPost);
router.get("/drafts", isAuthenticated, getDraftsPosts);
router.get("/scheduled_posts", isAuthenticated, getScheduledPosts);
router.get("/feed", isAuthenticated, getFacebookFeed);
router.post("/comments/:postId", isAuthenticated, getPostComments);
router.get("/analytics/:pageId/:postId", isAuthenticated, getPostAnalytics);
export default router


