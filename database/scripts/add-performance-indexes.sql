-- 添加性能优化的复合索引
-- 这些索引针对常用的查询模式进行优化

-- 1. 发布状态 + 分类ID + 更新时间复合索引
-- 用于优化按分类筛选已发布专栏并按更新时间排序的查询
CREATE INDEX IF NOT EXISTS columns_published_category_updated_idx 
ON columns (isPublished, categoryId, updatedAt);

-- 2. 发布状态 + 更新时间复合索引  
-- 用于优化获取所有已发布专栏并按更新时间排序的查询
CREATE INDEX IF NOT EXISTS columns_published_updated_idx 
ON columns (isPublished, updatedAt);

-- 3. 分类ID + 更新时间复合索引
-- 用于优化按分类查询并按更新时间排序的查询
CREATE INDEX IF NOT EXISTS columns_category_updated_idx 
ON columns (categoryId, updatedAt);

-- 查询当前所有索引状态
-- SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='columns' ORDER BY name; 