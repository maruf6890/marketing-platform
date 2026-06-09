ALTER TABLE post_analytics
  ADD CONSTRAINT fk_post_analytics_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;