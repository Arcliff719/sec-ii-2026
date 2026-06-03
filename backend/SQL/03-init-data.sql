-- ============================================
-- CampusHub 初始化数据
-- ============================================

USE campushub;

-- 初始化需求分类数据
INSERT INTO categories (name, has_review, sort_order) VALUES
    ('快递代取', 1, 1),
    ('学习辅导', 1, 2),
    ('二手交易', 0, 3),
    ('组队匹配', 0, 4)
ON DUPLICATE KEY UPDATE
    has_review = VALUES(has_review),
    sort_order = VALUES(sort_order);

-- 测试用户。密码均为 Test123456；phone 为占位数据，真实注册会写入 AES 手机号。
INSERT INTO users (
    name,
    email,
    phone,
    password_hash,
    role,
    credit_score,
    status,
    nickname,
    student_id
) VALUES
    ('张三', 'zhangsan@campus.edu', 'encrypted_phone_1', '$2b$10$2DMBDXChU2GLMx3jQoD5fOTpT8zW4RmGOrxJfbH7y9vSFwu.ydmiS', 'requester', 100, 1, '张三', '20240001'),
    ('李四', 'lisi@campus.edu', 'encrypted_phone_2', '$2b$10$2DMBDXChU2GLMx3jQoD5fOTpT8zW4RmGOrxJfbH7y9vSFwu.ydmiS', 'provider', 100, 1, '李四', '20240002')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = VALUES(role),
    credit_score = VALUES(credit_score),
    status = VALUES(status),
    nickname = VALUES(nickname),
    student_id = VALUES(student_id);
