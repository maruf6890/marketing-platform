ALTER TABLE posts
ADD COLUMN platform_asset_id INT NULL;

ALTER TABLE posts 
ADD FOREIGN KEY (platform_asset_id) REFERENCES user_platform_assets (id) ON UPDATE CASCADE ON DELETE SET NULL;