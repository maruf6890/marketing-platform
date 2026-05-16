
-- ------------------------------------------------------------
--  users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- bcrypt hashes are always 60 chars; 255 is conventional
    avatar_url  TEXT          DEFAULT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
--  platforms
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platforms (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(50) NOT NULL UNIQUE,
    base_url TEXT
);

-- ------------------------------------------------------------
--  user_platform_accounts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_platform_accounts (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT     NOT NULL,
    platform_id       INT     NOT NULL,
    platform_user_id  TEXT,
    access_token      TEXT    NOT NULL,
    refresh_token     TEXT,
    token_expires_at  TIMESTAMP NULL DEFAULT NULL,
    scopes            JSON,
    is_active         BOOLEAN   DEFAULT TRUE,
    last_synced_at    TIMESTAMP NULL DEFAULT NULL,
    connected_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE  KEY unique_user_platform (user_id, platform_id),
    INDEX   idx_upa_user_id     (user_id),
    INDEX   idx_upa_platform_id (platform_id),

    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  user_platform_assets
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_platform_assets (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    account_id   INT          NOT NULL,
    asset_id     TEXT         NOT NULL,
    name         VARCHAR(150),
    type         VARCHAR(30),
    access_token TEXT,
    is_primary   BOOLEAN      DEFAULT FALSE,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    -- FIX: prevent duplicate assets per account
    -- Note: asset_id is TEXT; we index a prefix to allow the unique key
    UNIQUE KEY unique_account_asset (account_id, asset_id(191)),
    INDEX  idx_upa_assets_account_id (account_id),

    FOREIGN KEY (account_id) REFERENCES user_platform_accounts(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT  NOT NULL,

    -- FIX: ENUM enforces allowed values
    content_type ENUM('post', 'story', 'short_video') NOT NULL,

    title        VARCHAR(255),
    content      TEXT,

    -- FIX: ENUM enforces allowed values
    status       ENUM('draft', 'scheduled', 'published', 'failed', 'archived')
                     DEFAULT 'draft',

    scheduled_at TIMESTAMP NULL DEFAULT NULL,
    published_at TIMESTAMP NULL DEFAULT NULL,
    expires_at   TIMESTAMP NULL DEFAULT NULL,   -- for stories

    -- FIX: ENUM enforces allowed values
    visibility   ENUM('public', 'private', 'unlisted') DEFAULT 'public',

    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_posts_user_id (user_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
--  media
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT  NOT NULL,
    post_id          INT  DEFAULT NULL,

    -- FIX: ENUM enforces allowed values
    type             ENUM('image', 'video', 'gif', 'audio') NOT NULL,

    url              TEXT    NOT NULL,
    thumbnail_url    TEXT,
    width            INT,
    height           INT,
    size_bytes       BIGINT,
    duration_seconds INT,
    format           VARCHAR(20),

    -- FIX: ENUM enforces allowed values
    upload_status    ENUM('uploading', 'uploaded', 'failed') DEFAULT 'uploaded',

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_media_user_id (user_id),
    INDEX idx_media_post_id (post_id),

    FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE SET NULL
    -- SET NULL so deleting a post doesn't silently delete orphaned media files
    -- your app should periodically clean up media rows where post_id IS NULL
);

-- ------------------------------------------------------------
--  post_analytics
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_analytics (
    id               INT AUTO_INCREMENT PRIMARY KEY,

    -- FIX: added FK back to posts so analytics are never orphaned
    post_id          INT          DEFAULT NULL,

    platform_post_id VARCHAR(255) NOT NULL,
    platform_name    VARCHAR(20)  NOT NULL,

    total_reactions  INT     DEFAULT 0,
    total_likes      INT     DEFAULT 0,
    total_comments   INT     DEFAULT 0,
    total_shares     INT     DEFAULT 0,
    total_views      INT     DEFAULT 0,
    total_clicks     INT     DEFAULT 0,

    engagement_rate  DECIMAL(5,2) DEFAULT 0.00,

    comment_insights      TEXT,
    response_summary      TEXT,
    marketing_suggestions TEXT,
    sentiment_summary     TEXT,

    -- FIX: ENUM enforces allowed values
    performance_label ENUM('viral', 'good', 'average', 'poor'),

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_platform_post (platform_post_id, platform_name),
    INDEX idx_pa_post_id (post_id),

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
    -- SET NULL keeps historical analytics even when a post is deleted
);

-- ------------------------------------------------------------
--  comments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    analytics_id        INT          NOT NULL,

    -- FIX: removed redundant platform_name (already on post_analytics);
    --      JOIN through analytics_id when the platform name is needed

    platform_user_id    VARCHAR(255),
    platform_comment_id VARCHAR(255),
    user_name           VARCHAR(150),
    message_summary     TEXT         NOT NULL,

    sentiment           VARCHAR(20),   -- positive | neutral | negative
    priority            VARCHAR(20),   -- low | mid | high

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_comment (platform_comment_id, analytics_id),
    INDEX idx_comments_analytics_id (analytics_id),

    FOREIGN KEY (analytics_id) REFERENCES post_analytics(id) ON DELETE CASCADE
);
