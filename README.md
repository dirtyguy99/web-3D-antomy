# Thùng phụ · Engineering Explorer

Trang web khám phá mô hình thực tế từ `ban test thung phu.STEP` của người dùng. Phong cách trình bày tham khảo [Anatomy](https://github.com/wheresryan22/anatomy); phần dựng hình dùng Three.js để giữ nguyên hình học CAD.

## Mở trên máy

Chạy `node scripts/serve.mjs` trong thư mục này, rồi mở http://localhost:4173. File `dist/index.html` cần được phục vụ qua HTTP (các trình duyệt chặn việc tải module/dữ liệu bằng file://).

## Chức năng

- Xoay, pan, zoom; bốn góc nhìn; vừa khung; tự xoay.
- Chọn chi tiết từ hình 3D hoặc danh sách; tìm theo tên có/không dấu; ẩn/hiện từng chi tiết và nhóm.
- Cô lập, phóng tới chi tiết; xem mã gốc và kích thước bao.
- Bung lắp ráp theo thanh trượt, chuyển động minh họa, ẩn vỏ, bật/tắt cạnh.
- Giao diện sáng/tối, lưu ảnh PNG, giao diện điện thoại, điều khiển bàn phím và giảm chuyển động.

## Nguồn dữ liệu và giới hạn

122 mesh, 69 tên chi tiết khác nhau, 90.542 tam giác, nhập STEP bằng occt-import-js / OpenCascade. Lưu tên gốc và vị trí lắp; đổi trục trực chuẩn và đơn vị để hiển thị. Không có chi tiết cơ khí tự vẽ thay thế.

Kích thước trên giao diện là kích thước bao theo trục mô hình sau chia lưới, làm tròn mm; không phải kích thước chế tạo, chiều dài theo trục riêng hay dung tích. Độ lệch tuyến tính chia lưới được đặt 0,5 mm. Phân loại thành 7 nhóm để khám phá dựa trên tên part, không thay thế cây lắp gốc. Chế độ bung là dịch chuyển minh họa phục vụ quan sát, không phải mô phỏng động học, trình tự tháo lắp hoặc kiểm tra va chạm.

File CAD gốc không bị sửa và không nằm trong website. Dữ liệu hiển thị gồm `dist/assets/model.json` và `model.bin`.

## Tái tạo dữ liệu

Cài phụ thuộc trong package.json, chạy `node scripts/inspect-step.mjs` rồi `node scripts/convert.mjs`. Script đọc STEP ở thư mục cha; lưu file trung gian vào `.cache` (không đưa vào nguồn xuất bản). Mã SHA-256 của nguồn được lưu trong model.json.

## Ghi công

- Ý tưởng trình bày: Anatomy, wheresryan22, MIT. Không sử dụng thư viện hình học của Anatomy vì cần giữ hình học CAD gốc.
- Three.js, MIT: `dist/vendor/THREE-LICENSE.txt`.
- occt-import-js: chỉ dùng trong bước chuyển đổi cục bộ; không đưa OpenCascade/WASM lên web.
- Font Be Vietnam Pro từ Google Fonts; trình duyệt dùng Arial nếu không có mạng.
