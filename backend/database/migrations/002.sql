ALTER TABLE posts
MODIFY COLUMN status ENUM(
  'draft',
  'scheduled',
  'published',
  'failed',
  'archived',
  'publishable'
) DEFAULT 'draft';