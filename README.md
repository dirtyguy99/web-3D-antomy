# Hệ thống xe thu gom rác · Engineering Explorer

Trang Home có năm mục: **Tổng quan về xe**, **Thùng phụ**, **Thùng chính**, **Thân xe**, **Cặp nâng thùng rác**. Mục tổng quan nổi bật ở đầu bộ sưu tập; mỗi thẻ có ảnh 3D, mô tả và đường dẫn vào trình xem riêng. Phong cách trình bày tham khảo [Anatomy](https://github.com/wheresryan22/anatomy).

Chủ đề **Liquid Glass** được áp dụng qua `dist/glass.css`, giữ bố cục gốc của Home và trình xem. Các bề mặt kính có chế độ sáng/tối, nền mờ, viền phản sáng và màu xanh cho thao tác chọn. Trình duyệt không hỗ trợ `backdrop-filter` hoặc bật giảm độ trong suốt sẽ dùng nền đặc dễ đọc.

Thùng phụ và thùng chính dùng mô hình thực tế của người dùng. Thùng chính được xuất từ `THUNG CHINH.STEP.SLDASM` sang STEP và chia lưới, gồm **74 khối hình học thuộc 12 part đang bật**, phân thành 6 nhóm. Các khối trong part đa thân vẫn được đặt đúng vị trí gốc và gắn với tên part tương ứng. `01_09_Tru ban xa` đang suppressed trong cấu hình nguồn, nên chưa có hình học hiển thị; trang ghi rõ trạng thái này.

Tổng quan, thân xe và cặp nâng vẫn ghi **Chờ mô hình**. Tổng quan dùng hình học của hai cụm thùng thật cùng các hình minh họa khác; vị trí, tỷ lệ và liên kết của toàn xe là minh họa, đang chờ bản lắp tổng thể để thay thế.

## Mở trên máy

Chạy `node scripts/serve.mjs` trong thư mục này, rồi mở http://localhost:4173. File `dist/index.html` cần được phục vụ qua HTTP (các trình duyệt chặn việc tải module/dữ liệu bằng file://).

Home: `/`. Trình xem: `/explorer.html?module=tong-quan`, `thung-phu`, `thung-chinh`, `than-xe` hoặc `cap-nang`. Tất cả các trang có thanh chuyển nhanh, menu đổi mục và các liên kết trước/sau theo vòng. Trong tổng quan, chọn chi tiết rồi bấm **Mở [tên cụm]** để vào trang riêng; các trang cụm có **Xem trên toàn xe** để quay lại tổng quan. Giao diện sáng/tối được giữ khi chuyển trang trong cùng phiên trình duyệt.

Vercel dùng thư mục `dist`, preset Other, bỏ qua build và cài đặt. `vercel.json` lưu sẵn cấu hình này.

## Bổ sung mô hình sau này

Danh mục nằm tại `dist/catalog.js`. Mỗi mục chỉ định tên, mô tả, ảnh `preview`, file hình học `meta` và `binary`, cùng trạng thái `ready`. Khi có dữ liệu thật, thay đường dẫn dữ liệu và ảnh của mục đó, đặt `ready: true`; Home và trình xem dùng chung cấu hình.

`scripts/build-demos.mjs` tạo lại ba mô hình minh họa từ các khối cơ khí bằng Three.js. Các file trong `dist/assets/demo` chỉ dùng để chờ thay bằng dữ liệu CAD thực tế. Hình thu nhỏ trong `dist/assets/previews` được chụp từ các trình xem tương ứng.

`scripts/build-overview.mjs` tạo lại hình minh họa toàn xe, gom các bộ phận thành bốn nhóm có thuộc tính `component` liên kết tới từng trang. Mục tổng quan vẫn đặt `ready: false` cho đến khi có bản lắp toàn xe được xác nhận.

## Cập nhật CAD thùng chính

Trên máy có SolidWorks, chạy `scripts/export-solidworks.ps1` bằng Windows PowerShell 5.1 với `-SourcePath` trỏ tới assembly và `-StepPath` trỏ tới file STEP mới. Script mở chỉ đọc khi cần, xuất theo cấu hình hiện tại, lưu thông tin part vào `.cache/thung-chinh-components.json` và kiểm tra assembly gốc không bị thay đổi. Nó không ghi đè STEP đã có và không đóng các tài liệu đã mở trước đó.

Sau đó chạy `node scripts/inspect-cad.mjs <STEP> thung-chinh` và `node scripts/convert-main.mjs <STEP>`. File khối 3D của thùng chính nằm ở `dist/assets/cad/thung-chinh.json` và `.bin`. `convert-main.mjs` gắn tên part dựa trên tên cụm trong STEP và hộp bao của các component SolidWorks; không có part đang bật nào bị bỏ qua. Chạy lại `node scripts/build-overview.mjs` và chụp ảnh xem trước khi cập nhật dữ liệu CAD.

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
