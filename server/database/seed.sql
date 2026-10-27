-- PinkPitch – Seed Data: ข้อมูลสินค้าเริ่มต้นทั้งหมด (34 รายการ)
-- 5 ลีกใหญ่ (Premier League, La Liga, Bundesliga, Serie A, Ligue 1) + FIFA World Cup 2026 + ทีมชาติไทย
-- รันซ้ำได้: สินค้าที่มี (name, season) เดิมอยู่แล้วจะถูกข้าม ไม่สร้างซ้ำและไม่เขียนทับการแก้ไขของ Admin
-- รัน:  npm run db:seed
-- (บัญชี Admin ไม่อยู่ในไฟล์นี้ ให้สร้างด้วย npm run db:admin)

INSERT INTO products (name, team_name, season, category, description, price, sizes, color, stock, image_url, is_active, featured, kit)
VALUES
  -- ============================================================
  -- PREMIER LEAGUE
  -- ============================================================
  ('Manchester United Home Jersey', 'Manchester United', '2025/26', 'Premier League',
   'เสื้อเหย้าสีแดงปีศาจ ดีไซน์เรียบหรู คอปกสไตล์เรโทร ผ้าแห้งเร็ว เหมาะกับแฟนผีแดงทุกคน',
   2390, '["S","M","L","XL","XXL"]'::jsonb, 'Red', 30, '/images/jerseys/manchester-united-home.jpg', true, true,
   '{"primary":"#DA291C","secondary":"#FBE122","pattern":"plain","label":"MUN"}'::jsonb),

  ('Liverpool Home Jersey', 'Liverpool', '2025/26', 'Premier League',
   'เสื้อเหย้าสีแดงเข้มของหงส์แดง ตัดเย็บแนบตัว ผ้าเนื้อละเอียดซับเหงื่อดี ตราสโมสรปักนูน',
   2390, '["S","M","L","XL","XXL"]'::jsonb, 'Red', 22, '/images/jerseys/liverpool-home.jpg', true, false,
   '{"primary":"#C8102E","secondary":"#F6EB61","pattern":"plain","label":"LIV"}'::jsonb),

  ('Arsenal Home Jersey', 'Arsenal', '2025/26', 'Premier League',
   'เสื้อเหย้าลำตัวสีแดงแขนขาวตามแบบฉบับปืนใหญ่ลอนดอน น้ำหนักเบา ระบายอากาศได้ดี',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Red / White', 9, '/images/jerseys/arsenal-home.jpg', true, false,
   '{"primary":"#EF0107","secondary":"#FFFFFF","pattern":"sleeves","label":"ARS"}'::jsonb),

  ('Chelsea Home Jersey', 'Chelsea', '2025/26', 'Premier League',
   'เสื้อเหย้าสีน้ำเงินเข้มของสิงห์บลู ผ้าทอพิเศษสัมผัสนุ่ม ขอบแขนและคอสีขาวตัดกันสวยงาม',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Royal Blue', 14, '/images/jerseys/chelsea-home.jpg', true, false,
   '{"primary":"#034694","secondary":"#FFFFFF","pattern":"plain","label":"CHE"}'::jsonb),

  ('Manchester City Jersey', 'Manchester City', '2025/26', 'Premier League',
   'เสื้อสีฟ้าสดใสของเรือใบสีฟ้า ตัดเย็บทรงทันสมัย ผ้าเบาแห้งเร็ว มีรายละเอียดลายทอในเนื้อผ้า',
   2390, '["S","M","L","XL","XXL"]'::jsonb, 'Sky Blue', 20, '/images/jerseys/manchester-city-home.jpg', true, false,
   '{"primary":"#6CABDD","secondary":"#1C2C5B","pattern":"plain","label":"MCI"}'::jsonb),

  ('Manchester City Away Jersey', 'Manchester City', '2025/26', 'Premier League',
   'เสื้อเยือนสีเข้มของ City ดีไซน์ทันสมัย ผ้า Nike Dri-FIT ADV ระบายอากาศเยี่ยม ลายกราฟิกพิเศษที่แขน คอลเลกชันลิมิเต็ด',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'Deep Navy', 12, '/images/jerseys/manchester-city-away.jpg', true, false,
   '{"primary":"#1C2C5B","secondary":"#6CABDD","pattern":"plain","label":"MCI"}'::jsonb),

  ('Tottenham Hotspur Home Jersey', 'Tottenham Hotspur', '2025/26', 'Premier League',
   'เสื้อเหย้าสีขาวบริสุทธิ์ของ Spurs ตัดเย็บทรงสปอร์ต คอกลม ผ้าระบายอากาศ DryFit น้ำหนักเบามาก เหมาะสำหรับทั้งในสนามและสวมใส่ทั่วไป',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'White / Navy', 20, '/images/jerseys/tottenham-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#132257","pattern":"plain","label":"TOT"}'::jsonb),

  ('Newcastle United Home Jersey', 'Newcastle United', '2025/26', 'Premier League',
   'เสื้อลายทางดำ-ขาวสุดเท่ของอีกาดำ ผ้าแน่นทอสลับสีสวยงาม ขอบคอและแขนสีดำ ใส่สบายทุกสภาพอากาศ',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Black / White', 18, '/images/jerseys/newcastle-home.jpg', true, false,
   '{"primary":"#241F20","secondary":"#FFFFFF","pattern":"stripes","label":"NEW"}'::jsonb),

  ('Aston Villa Home Jersey', 'Aston Villa', '2025/26', 'Premier League',
   'เสื้อเหย้าสีน้ำตาลแดง-ฟ้าอมเขียวอันเป็นเอกลักษณ์ของ Villa Park ผ้าเนื้อนุ่ม ซับเหงื่อดี ตราสมาคมปักนูนคมชัด',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Claret / Blue', 15, '/images/jerseys/aston-villa-home.jpg', true, false,
   '{"primary":"#95BFE5","secondary":"#670E36","pattern":"quarters","label":"AVL"}'::jsonb),

  -- ============================================================
  -- LA LIGA
  -- ============================================================
  ('Real Madrid Home Jersey', 'Real Madrid', '2025/26', 'La Liga',
   'เสื้อเหย้าสีขาวคลาสสิกของราชันชุดขาว ผ้าระบายอากาศน้ำหนักเบา ขอบคอและแขนสีทอง ใส่สบายทั้งในสนามและชีวิตประจำวัน',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'White / Gold', 24, '/images/jerseys/real-madrid-home.jpg', true, true,
   '{"primary":"#FFFFFF","secondary":"#E3B23C","pattern":"plain","label":"RMA"}'::jsonb),

  ('FC Barcelona Home Jersey', 'FC Barcelona', '2025/26', 'La Liga',
   'เสื้อลายทางสีบลูกรานาที่เป็นเอกลักษณ์ของบาร์ซ่า เนื้อผ้านุ่ม ยืดหยุ่นดี ตัดเย็บทรงสปอร์ตสวมใส่สบาย',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'Blue / Garnet', 18, '/images/jerseys/fc-barcelona-home.jpg', true, true,
   '{"primary":"#A50044","secondary":"#004D98","pattern":"stripes","label":"FCB"}'::jsonb),

  ('FC Barcelona Away Jersey', 'FC Barcelona', '2025/26', 'La Liga',
   'เสื้อเยือนสีทองสุดหรูหราของบาร์เซโลน่า ดีไซน์สีสดใส ผ้าน้ำหนักเบา ลวดลายพิเศษบนเนื้อผ้า',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'Gold / Black', 10, '/images/jerseys/fc-barcelona-away.jpg', true, false,
   '{"primary":"#EDBB00","secondary":"#16181F","pattern":"plain","label":"FCB"}'::jsonb),

  ('Atletico Madrid Home Jersey', 'Atletico Madrid', '2025/26', 'La Liga',
   'เสื้อลายทางแดง-ขาวสุดมัน ดีไซน์กล้าหาญแบบฉบับ Colchoneros แถบแนวตั้งคมชัด ผ้าหนักแน่นพรีเมียม',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'Red / White Stripes', 16, '/images/jerseys/atletico-madrid-home.jpg', true, true,
   '{"primary":"#CE3524","secondary":"#FFFFFF","pattern":"stripes","label":"ATM"}'::jsonb),

  ('Real Sociedad Home Jersey', 'Real Sociedad', '2025/26', 'La Liga',
   'เสื้อลายทางน้ำเงิน-ขาวอันงดงามของสโมสรจากเมืองซาน เซบาสเตียน ตัดเย็บประณีต ผ้านุ่มเบา',
   2190, '["S","M","L","XL","XXL"]'::jsonb, 'Blue / White', 14, '/images/jerseys/real-sociedad-home.jpg', true, false,
   '{"primary":"#003DA5","secondary":"#FFFFFF","pattern":"stripes","label":"RSO"}'::jsonb),

  -- ============================================================
  -- BUNDESLIGA
  -- ============================================================
  ('Bayern Munich Jersey', 'Bayern Munich', '2025/26', 'Bundesliga',
   'เสื้อสีแดงของเสือใต้ ดีไซน์เรียบแต่ดุดัน คอวีสีขาว ผ้าระบายอากาศ น้ำหนักเบา',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'Red', 12, '/images/jerseys/bayern-munich-home.jpg', true, false,
   '{"primary":"#DC052D","secondary":"#FFFFFF","pattern":"plain","label":"FCB"}'::jsonb),

  ('Borussia Dortmund Home Jersey', 'Borussia Dortmund', '2025/26', 'Bundesliga',
   'เสื้อสีเหลืองสดของ Die Borussen โดดเด่นที่สุดในสนาม สีเหลืองสัญลักษณ์ Signal Iduna Park ผ้าเบาระบายอากาศดีเยี่ยม',
   2390, '["S","M","L","XL","XXL"]'::jsonb, 'Yellow / Black', 22, '/images/jerseys/borussia-dortmund-home.jpg', true, true,
   '{"primary":"#FDE100","secondary":"#16181F","pattern":"plain","label":"BVB"}'::jsonb),

  ('Bayer Leverkusen Home Jersey', 'Bayer Leverkusen', '2025/26', 'Bundesliga',
   'เสื้อสีดำสลับแดงของ Werkself แชมป์บุนเดสลีกา ดีไซน์เข้มแข็ง ผ้าคุณภาพสูง ซับเหงื่อดี',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Black / Red', 17, '/images/jerseys/bayer-leverkusen-home.jpg', true, false,
   '{"primary":"#E32221","secondary":"#16181F","pattern":"halves","label":"B04"}'::jsonb),

  ('RB Leipzig Home Jersey', 'RB Leipzig', '2025/26', 'Bundesliga',
   'เสื้อสีขาวของ Die Roten Bullen ดีไซน์สะอาดเรียบหรู ลายกราฟิกนิดหน่อยบนหน้าอก ผ้า Adidas AEROREADY',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'White / Red', 13, '/images/jerseys/rb-leipzig-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#CC0B2F","pattern":"plain","label":"RBL"}'::jsonb),

  -- ============================================================
  -- SERIE A
  -- ============================================================
  ('Juventus Jersey', 'Juventus', '2025/26', 'Serie A',
   'เสื้อลายทางขาวดำอันเป็นตำนานของยูเวนตุส ตัดเย็บประณีต ใส่สบาย เหมาะกับแฟนบอลอิตาลี',
   2390, '["S","M","L","XL","XXL"]'::jsonb, 'Black / White', 0, '/images/jerseys/juventus-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#16181F","pattern":"stripes","label":"JUV"}'::jsonb),

  ('AC Milan Home Jersey', 'AC Milan', '2025/26', 'Serie A',
   'เสื้อลายทางแดง-ดำอันเป็นสัญลักษณ์ของ Rossoneri ตำนานแห่งวงการฟุตบอลอิตาลี ผ้าพรีเมียมตัดเย็บอย่างดี',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'Red / Black', 19, '/images/jerseys/ac-milan-home.jpg', true, true,
   '{"primary":"#FB090B","secondary":"#16181F","pattern":"stripes","label":"ACM"}'::jsonb),

  ('Inter Milan Home Jersey', 'Inter Milan', '2025/26', 'Serie A',
   'เสื้อลายทางน้ำเงิน-ดำของ Nerazzurri แชมป์เซเรีย อา ตัดเย็บประณีต ผ้าน้ำหนักเบา เหมาะสำหรับสะสม',
   2490, '["S","M","L","XL","XXL"]'::jsonb, 'Blue / Black', 21, '/images/jerseys/inter-milan-home.jpg', true, true,
   '{"primary":"#003DA5","secondary":"#16181F","pattern":"stripes","label":"INT"}'::jsonb),

  ('SSC Napoli Home Jersey', 'SSC Napoli', '2025/26', 'Serie A',
   'เสื้อสีฟ้าท้องทะเลของนาโปลี สีอัตลักษณ์ที่สวยงามไม่เหมือนใคร ผ้านุ่มเบา ระบายอากาศ เหมาะกับสภาพอากาศร้อน',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Light Blue', 15, '/images/jerseys/ssc-napoli-home.jpg', true, false,
   '{"primary":"#12A0D7","secondary":"#FFFFFF","pattern":"plain","label":"NAP"}'::jsonb),

  ('AS Roma Home Jersey', 'AS Roma', '2025/26', 'Serie A',
   'เสื้อสีทับทิมแดงของ Giallorossi สโมสรที่มีแฟนบอลอันดับต้นของอิตาลี ผ้าเนื้อดีตัดเย็บพรีเมียม',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Crimson / Gold', 11, '/images/jerseys/as-roma-home.jpg', true, false,
   '{"primary":"#9B1C31","secondary":"#EDB82B","pattern":"plain","label":"ROM"}'::jsonb),

  -- ============================================================
  -- LIGUE 1
  -- ============================================================
  ('Paris Saint-Germain Jersey', 'Paris Saint-Germain', '2025/26', 'Ligue 1',
   'เสื้อสีน้ำเงินกรมท่าพร้อมแถบแดงกลางลำตัว สัญลักษณ์ของมหานครปารีส ผ้านุ่มใส่สบาย',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'Navy / Red', 16, '/images/jerseys/psg-home.jpg', true, true,
   '{"primary":"#004170","secondary":"#DA291C","pattern":"band","label":"PSG"}'::jsonb),

  ('Olympique de Marseille Home Jersey', 'Olympique de Marseille', '2025/26', 'Ligue 1',
   'เสื้อสีขาวบริสุทธิ์ของ OM สโมสรจากทะเลเมดิเตอร์เรเนียน ดีไซน์เรียบหรู คอวี ผ้าคุณภาพสูง',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'White / Sky Blue', 16, '/images/jerseys/marseille-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#009BDE","pattern":"plain","label":"OM"}'::jsonb),

  ('AS Monaco Home Jersey', 'AS Monaco', '2025/26', 'Ligue 1',
   'เสื้อลายทางแดง-ขาวของสโมสรแห่งราชรัฐโมนาโก ตัดเย็บอย่างดี ผ้าพรีเมียมสไตล์ Monegasque',
   2290, '["S","M","L","XL","XXL"]'::jsonb, 'Red / White', 13, '/images/jerseys/as-monaco-home.jpg', true, false,
   '{"primary":"#CE1B26","secondary":"#FFFFFF","pattern":"halves","label":"ASM"}'::jsonb),

  ('Olympique Lyonnais Home Jersey', 'Olympique Lyonnais', '2025/26', 'Ligue 1',
   'เสื้อสีขาวของ OL ดีไซน์สะอาด ขอบแขนและคอสีแดงตัดกันสวย ผ้าระบายอากาศเทคโนโลยีทันสมัย',
   2190, '["S","M","L","XL","XXL"]'::jsonb, 'White / Red', 14, '/images/jerseys/olympique-lyonnais-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#D5282A","pattern":"plain","label":"OL"}'::jsonb),

  -- ============================================================
  -- NATIONAL TEAMS & FIFA WORLD CUP 2026
  -- ============================================================
  ('Thailand National Team Jersey', 'Thailand', '2026', 'National Team',
   'เสื้อทีมชาติไทย ช้างศึก สีแดงพร้อมลายกราฟิกเอกลักษณ์ไทย ผ้าเทคโนโลยีระบายอากาศ สนับสนุนทัพช้างศึกได้ทุกที่',
   1790, '["S","M","L","XL","XXL"]'::jsonb, 'Red / Navy', 40, '/images/jerseys/thailand-home.jpg', true, true,
   '{"primary":"#A51931","secondary":"#2D2A4A","pattern":"plain","label":"THA"}'::jsonb),

  ('Argentina National Team Jersey', 'Argentina', '2026', 'National Team',
   'เสื้อลายทางฟ้าขาวของทีมชาติอาร์เจนตินา แชมป์โลก ผ้านุ่มน้ำหนักเบา ปักตราสมาคมนูนคมชัด',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'Sky Blue / White', 26, '/images/jerseys/argentina-home.jpg', true, true,
   '{"primary":"#75AADB","secondary":"#FFFFFF","pattern":"stripes","label":"ARG"}'::jsonb),

  ('Brazil National Team Home Jersey', 'Brazil', '2026', 'World Cup 2026',
   'เสื้อทีมชาติบราซิล สีเหลืองทองแสนงาม ผ้าระบายอากาศดีที่สุด 5 แชมป์โลก สวมใส่แล้วรู้สึกได้ถึงความยิ่งใหญ่ของ Seleção',
   2690, '["S","M","L","XL","XXL"]'::jsonb, 'Yellow / Green', 30, '/images/jerseys/brazil-home.jpg', true, true,
   '{"primary":"#FCDD04","secondary":"#009C3B","pattern":"plain","label":"BRA"}'::jsonb),

  ('France National Team Home Jersey', 'France', '2026', 'World Cup 2026',
   'เสื้อทีมชาติฝรั่งเศส Les Bleus สีน้ำเงิน ขาว แดง สัญลักษณ์แห่งชาติอันยิ่งใหญ่ แชมป์โลกสองสมัย ผ้าพรีเมียมจาก Nike',
   2690, '["S","M","L","XL","XXL"]'::jsonb, 'Navy Blue', 25, '/images/jerseys/france-home.jpg', true, true,
   '{"primary":"#003189","secondary":"#FFFFFF","pattern":"plain","label":"FRA"}'::jsonb),

  ('England National Team Home Jersey', 'England', '2026', 'World Cup 2026',
   'เสื้อสีขาวของ Three Lions ประดับตราสิงห์สามตัว ผ้าคุณภาพสูง เหมาะสำหรับแฟน ๆ ที่เชื่อมั่นใน It''s Coming Home',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'White / Navy', 22, '/images/jerseys/england-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#012169","pattern":"plain","label":"ENG"}'::jsonb),

  ('Germany National Team Home Jersey', 'Germany', '2026', 'World Cup 2026',
   'เสื้อสีขาวคลาสสิกของ Die Mannschaft 4 แชมป์โลก ดีไซน์โมเดิร์นจาก Adidas แถบสีดำที่ไหล่ ผ้าเบาระบายอากาศ',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'White / Black', 20, '/images/jerseys/germany-home.jpg', true, false,
   '{"primary":"#FFFFFF","secondary":"#000000","pattern":"plain","label":"GER"}'::jsonb),

  ('Spain National Team Home Jersey', 'Spain', '2026', 'World Cup 2026',
   'เสื้อสีแดงสดของ La Roja แชมป์โลก 1 สมัย แชมป์ยูโร 4 สมัย ผ้าพรีเมียมจาก Adidas ตราสมาคมฟุตบอลสเปนปักนูน',
   2590, '["S","M","L","XL","XXL"]'::jsonb, 'Red', 18, '/images/jerseys/spain-home.jpg', true, true,
   '{"primary":"#C60B1E","secondary":"#FFC400","pattern":"plain","label":"ESP"}'::jsonb)

ON CONFLICT (name, season) DO NOTHING;
