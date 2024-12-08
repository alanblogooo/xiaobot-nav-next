-- 创建users表
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- 添加临时用户
INSERT INTO "users" ("id") VALUES (1);

-- 为rebates表添加userId列，默认值为1
ALTER TABLE "rebates" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- 添加外键约束
PRAGMA foreign_keys=OFF;
ALTER TABLE "rebates" ADD CONSTRAINT "rebates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
PRAGMA foreign_keys=ON;

-- 移除默认值约束（如果需要的话）
-- 注意：SQLite不支持移除默认值，所以我们保留它 