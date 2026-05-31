INSERT INTO platforms (name, base_url)
VALUES
('facebook', 'https://graph.facebook.com'),
('instagram', 'https://graph.facebook.com'),
('youtube', 'https://www.googleapis.com/youtube/v3')
ON DUPLICATE KEY UPDATE
base_url = VALUES(base_url);