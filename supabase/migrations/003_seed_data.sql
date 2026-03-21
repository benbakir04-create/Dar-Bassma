-- ============================================================
-- Migration 003: البيانات الأولية
-- ============================================================

-- ---- الإعدادات ----
INSERT INTO settings (key, value, description) VALUES
  ('app_name',              'دار القلم للنشر التعليمي', 'اسم المنصة'),
  ('tax_rate',              '0.15',                      'نسبة الضريبة 15%'),
  ('currency',              'ر.س',                       'رمز العملة'),
  ('low_stock_threshold',   '10',                        'حد تنبيه المخزون المنخفض'),
  ('proforma_validity_days','30',                         'صلاحية الفاتورة المسبقة بالأيام'),
  ('admin_email',           'admin@daralgalam.com',      'بريد الإدارة للإشعارات'),
  ('app_version',           '1.0.0',                     'إصدار التطبيق')
ON CONFLICT DO NOTHING;

-- ---- المواد الدراسية ----
INSERT INTO subjects (id, name, name_en, icon, color_hex, text_color_hex, sort_order) VALUES
  ('SUB01', 'اللغة العربية',   'Arabic',   '✍️', '#EBF3FF', '#1A4A8A', 1),
  ('SUB02', 'الرياضيات',      'Math',     '🔢', '#FFF0EB', '#8B2500', 2),
  ('SUB03', 'العلوم',          'Science',  '🔬', '#EAFBF3', '#0A5C3A', 3),
  ('SUB04', 'اللغة الإنجليزية','English',  '🌐', '#F5EEFF', '#4A1A8A', 4),
  ('SUB05', 'التربية الإسلامية','Islamic',  '☪️', '#FFF8E1', '#7A5A00', 5),
  ('SUB06', 'الاجتماعيات',    'Social',   '🌍', '#FFE8EE', '#8A1A3A', 6),
  ('SUB07', 'التربية الوطنية', 'Civic',    '🏛️', '#F0F4FF', '#1A2A8A', 7)
ON CONFLICT DO NOTHING;

-- ---- المستويات الدراسية ----
INSERT INTO levels (id, name, short_name, grade_number, stage, sort_order) VALUES
  ('LVL01', 'المستوى الأول',  'م1',  1,  'ابتدائي', 1),
  ('LVL02', 'المستوى الثاني', 'م2',  2,  'ابتدائي', 2),
  ('LVL03', 'المستوى الثالث', 'م3',  3,  'ابتدائي', 3),
  ('LVL04', 'المستوى الرابع', 'م4',  4,  'ابتدائي', 4),
  ('LVL05', 'المستوى الخامس', 'م5',  5,  'ابتدائي', 5),
  ('LVL06', 'المستوى السادس', 'م6',  6,  'ابتدائي', 6),
  ('LVL07', 'الأول متوسط',   'م.أ', 7,  'متوسط',   7),
  ('LVL08', 'الثاني متوسط',  'م.ث', 8,  'متوسط',   8),
  ('LVL09', 'الثالث متوسط',  'م.ج', 9,  'متوسط',   9),
  ('LVL10', 'الأول ثانوي',   'ث.أ', 10, 'ثانوي',   10),
  ('LVL11', 'الثاني ثانوي',  'ث.ث', 11, 'ثانوي',   11),
  ('LVL12', 'الثالث ثانوي',  'ث.ج', 12, 'ثانوي',   12)
ON CONFLICT DO NOTHING;

-- ---- كتب تجريبية ----
INSERT INTO books (title, author, subject_id, level_id, price, serial_no, cover_emoji, cover_color, category) VALUES
  ('لغتي الجميلة 1',       'د. فاطمة الزهراء', 'SUB01', 'LVL01', 45.00, 'AR-L1-001', '📖', '#EBF3FF', 'كتاب مقرر'),
  ('لغتي الجميلة 2',       'د. فاطمة الزهراء', 'SUB01', 'LVL02', 45.00, 'AR-L2-001', '📖', '#EBF3FF', 'كتاب مقرر'),
  ('لغتي الجميلة 3',       'د. فاطمة الزهراء', 'SUB01', 'LVL03', 45.00, 'AR-L3-001', '📖', '#EBF3FF', 'كتاب مقرر'),
  ('الرياضيات 1',           'أ. خالد العمري',   'SUB02', 'LVL01', 38.00, 'MT-L1-001', '📐', '#FFF0EB', 'كتاب مقرر'),
  ('الرياضيات 2',           'أ. خالد العمري',   'SUB02', 'LVL02', 38.00, 'MT-L2-001', '📐', '#FFF0EB', 'كتاب مقرر'),
  ('الرياضيات 3',           'أ. خالد العمري',   'SUB02', 'LVL03', 38.00, 'MT-L3-001', '📐', '#FFF0EB', 'كتاب مقرر'),
  ('العلوم للمستوى الأول',  'د. نورة السالم',   'SUB03', 'LVL01', 42.00, 'SC-L1-001', '🔬', '#EAFBF3', 'كتاب مقرر'),
  ('العلوم للمستوى الثالث', 'د. نورة السالم',   'SUB03', 'LVL03', 42.00, 'SC-L3-001', '🔬', '#EAFBF3', 'كتاب مقرر'),
  ('English For All 1',    'Mr. Yasser Ali',   'SUB04', 'LVL01', 55.00, 'EN-L1-001', '🌐', '#F5EEFF', 'كتاب مقرر'),
  ('English For All 3',    'Mr. Yasser Ali',   'SUB04', 'LVL03', 55.00, 'EN-L3-001', '🌐', '#F5EEFF', 'كتاب مقرر')
ON CONFLICT (serial_no) DO NOTHING;

-- ---- تهيئة المخزون للكتب ----
INSERT INTO inventory (book_id, quantity_available)
SELECT id, 100 FROM books
ON CONFLICT (book_id) DO NOTHING;

-- ملاحظة: بعد تشغيل هذا الملف
-- أنشئ حساب الأدمن الأول من Supabase Dashboard:
--   Authentication -> Users -> Invite User -> admin@darbassma.com
-- ثم أضف ملفه الشخصي يدوياً في جدول users:
-- INSERT INTO users (id, role, name) VALUES ('[AUTH_USER_ID]', 'admin', 'مدير النظام');
