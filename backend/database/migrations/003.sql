ALTER TABLE media
ADD COLUMN public_id VARCHAR(255) DEFAULT NULL;

ALTER TABLE media
ADD UNIQUE INDEX uniq_media_public_id (public_id);