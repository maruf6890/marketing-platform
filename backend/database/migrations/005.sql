ALTER TABLE post_analytics
ADD COLUMN description TEXT NULL,
ADD COLUMN content_recommendations TEXT NULL;

ALTER TABLE comments
ADD COLUMN message TEXT NULL,
ADD COLUMN created_time DATETIME NULL;