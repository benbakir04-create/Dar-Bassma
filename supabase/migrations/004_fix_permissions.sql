-- ============================================================
-- Migration 004: Fix Database Table Permissions
-- ============================================================
-- هذه الأوامر ضرورية لإعطاء صلاحية القراءة والتعديل (مع التزام الـ RLS) 
-- للمستخدمين المسجلين، لكي يستطيعون قراءة جداولهم.

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
