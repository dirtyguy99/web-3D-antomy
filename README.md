# MÔ HÌNH 3D XE ÉP RÁC

Trang Home có năm mục: **Tổng quan về xe**, **Thùng phụ**, **Thùng chính**, **Thân xe**, **Cặp nâng thùng rác**. Mỗi mục chiếm một hàng riêng với ảnh 3D và phần mô tả, ảnh luân phiên trái/phải khi xem trên máy tính. Trên điện thoại, ảnh nằm trên mô tả. Bấm vào mục để mở trình xem tương ứng. Phong cách trình bày tham khảo [Anatomy](https://github.com/wheresryan22/anatomy).

Home và mọi trang 3D dùng chung menu **Home, Tổng quan 3D, Thùng phụ, Thùng chính, Thân xe, Cặp nâng thùng rác**. `dist/site-header.js` lấy các mục từ danh mục chung và đánh dấu trang đang mở; `dist/site-header.css` giữ cùng kiểu trình bày, xếp menu thành hai hàng trên điện thoại. Biểu tượng cạnh tên website và favicon là xe ép rác vẽ bằng SVG, hỗ trợ cả nền sáng và tối. Các liên kết cũng nằm sẵn trong HTML để vẫn truy cập được khi JavaScript chưa chạy. Chạy `node scripts/qa-site-header.cjs` để kiểm tra menu, logo, trang đang chọn, thao tác bàn phím, liên kết thân xe/cặp nâng và bố cục ở năm chiều rộng.

Chủ đề **Liquid Glass** được áp dụng qua `dist/glass.css` cho các mục mô hình và trình xem. Các bề mặt kính có chế độ sáng/tối, nền mờ, viền phản sáng và màu xanh cho thao tác chọn. Trình duyệt không hỗ trợ `backdrop-filter` hoặc bật giảm độ trong suốt sẽ dùng nền đặc dễ đọc. `dist/home-showcase.css` quản lý bố cục Home tràn viền và các hàng mô hình so le; phần chữ nằm phía trên ánh phản chiếu để luôn rõ khi di chuột.

`dist/nature.css` đổi bảng màu sang **trắng và xanh lá**, với chế độ tối dùng xanh rừng. Bản màu mới mở ở chế độ sáng; lựa chọn sáng/tối tiếp theo được giữ xuyên các trang trong cùng phiên. Các điều khiển Liquid Glass của trình xem được giữ nguyên.

Home có **hoạt cảnh 2D tràn viền** ngay dưới menu, không có khung bo góc hay khoảng trống hai bên: xe thùng xanh, cabin trắng chạy qua cánh đồng, cây, đồi và ánh nắng. Nút dừng/tiếp tục chỉ có biểu tượng, giữ tên thao tác cho trình đọc màn hình và khi rê chuột. Minh họa trong `dist/assets/hero/truck-side.svg` được vẽ lại từ hình chiếu bên của bản lắp `Full_09_10_2.SLDASM`: giữ dáng cabin thấp hơn thùng, vách thùng chính phẳng, cụm thùng phụ nghiêng với tay đòn, hai trục bánh và khoảng cách trục 4.300 mm trong nguồn (sáu lốp do trục sau có bánh đôi). `node scripts/build-home-truck.mjs` kiểm tra nguồn CAD và nhúng bản vẽ vào `dist/index.html`. Đây là hình minh họa có lược bớt chi tiết nhỏ; các mục khám phá vẫn dùng dữ liệu CAD thực tế.

Bánh xe quay, vạch đường và phong cảnh trượt bằng CSS, không cần WebGL, Three.js hay tải hình học CAD trên Home. Tiêu đề nằm trên phần bầu trời; thống kê thư viện và bộ sưu tập nằm bên dưới cảnh. Nút đổi sáng/tối nổi ở góc dưới bên phải trên cả Home và trình xem, luôn thao tác được khi cuộn. Trên màn hình nhỏ, thanh danh mục vẫn ở giữa và được nâng lên một chút để không che nút đổi giao diện. Chế độ ảnh xem trước ẩn nút này.

`dist/home-drive.js` quản lý nút tạm dừng/tiếp tục, dừng hoạt cảnh khi ra ngoài màn hình hoặc tab bị ẩn, và điều chỉnh khung cảnh theo chiều cao menu trên điện thoại. Cài đặt giảm chuyển động hoặc không có JavaScript vẫn hiển thị một cảnh SVG tĩnh. `node scripts/qa-nature.cjs` kiểm tra chuyển động bằng ảnh render, quay bánh, dừng/tiếp tục, trạng thái ngoài màn hình, cảnh tĩnh, không tải mô hình 3D trên Home, màu sắc, chín kích thước màn hình và liên kết sang trình xem. Công cụ `scripts/build-hero-model.mjs` và dữ liệu trong `dist/assets/hero` thuộc cảnh 3D cũ, không còn được Home tải.

`dist/glass-motion.js` thêm chuyển động xuất hiện khi cuộn, ánh sáng trên kính theo con trỏ, phản hồi khi chạm và chuyển chế độ sáng/tối. Liên kết vẫn điều hướng trực tiếp, kết hợp với hiệu ứng xuất hiện của trang đích; đổi sáng/tối dùng View Transitions khi trình duyệt hỗ trợ. Khi bật giảm chuyển động, các hiệu ứng được tắt và nội dung luôn hiển thị ngay cả khi JavaScript chưa chạy.

Trình xem có thanh danh mục kính nổi ở chính giữa đáy màn hình, gồm năm biểu tượng và tên mục. Lớp kính chọn trượt theo thao tác hover/focus; liên kết vẫn mở trang trực tiếp và hỗ trợ bàn phím. Thanh **Bung lắp ráp** nằm dọc cạnh phải, kéo lên để tách, kéo xuống để lắp; nút chạy/dừng đặt ngay dưới thanh kéo. Trên điện thoại, thanh kéo chỉ xuất hiện trong vùng mô hình đang nhìn thấy, tránh các nút góc nhìn và thanh danh mục. `dist/explorer-dock.css` và `.js` quản lý bố cục, vùng an toàn, hiệu ứng kính và vị trí điều khiển; chế độ ảnh xem trước vẫn chỉ chứa mô hình. Chạy `node scripts/qa-dock.cjs` để kiểm tra kéo thực bằng chuột, bàn phím, vị trí điều khiển, năm mục ở các chiều rộng 768/390/320 px, sáng/tối và giảm chuyển động.

Thùng phụ và thùng chính dùng mô hình thực tế của người dùng. Thùng chính được xuất từ `THUNG CHINH.STEP.SLDASM` sang STEP và chia lưới, gồm **74 khối hình học thuộc 12 part đang bật**, phân thành 6 nhóm. Các khối trong part đa thân vẫn được đặt đúng vị trí gốc và gắn với tên part tương ứng. `01_09_Tru ban xa` đang suppressed trong cấu hình nguồn, nên chưa có hình học hiển thị; trang ghi rõ trạng thái này.

**Thân xe** và **Tổng quan về xe** dùng bản lắp `Full_09_10_2.SLDASM`. Thân xe gồm **211 khối hình học thuộc 144 part** của cabin và khung gầm, chia thành 7 nhóm. Tổng quan gồm **428 khối thuộc 296 part**, chia thành thân xe, thùng chính và thùng phụ; giữ nguyên tỷ lệ và vị trí lắp trong nguồn. Cabin là một part đa thân, nên các khối không có tên riêng được ghi “Cabin · thân N” thay vì tự đặt tên bộ phận.

Home có **4/5 mục đã có mô hình thực tế**. Cặp nâng thùng rác vẫn **Chờ mô hình** và chưa được ghép vào bản tổng thể thực tế. Hai part đang ẩn riêng trong nguồn (`Part1^FULL.STEP` và `4_10_tam_che_thung_sau`) được ẩn khi mở tổng quan; **Hiện lại tất cả** hiện đủ 428 khối, **Đặt lại** khôi phục 426 khối đang hiện. Các trang thùng riêng giữ dữ liệu từ những bản lắp đã cung cấp trước đó, có cấu hình và số part khác bản tổng thể.

## Mở trên máy

Chạy `node scripts/serve.mjs` trong thư mục này, rồi mở http://localhost:4173. File `dist/index.html` cần được phục vụ qua HTTP (các trình duyệt chặn việc tải module/dữ liệu bằng file://).

Home: `/`. Trình xem: `/explorer.html?module=tong-quan`, `thung-phu`, `thung-chinh`, `than-xe` hoặc `cap-nang`. Tất cả các trang có thanh chuyển nhanh, menu đổi mục và các liên kết trước/sau theo vòng. Trong tổng quan, chọn chi tiết rồi bấm **Mở [tên cụm]** để vào trang riêng; các trang cụm có **Xem trên toàn xe** để quay lại tổng quan. Giao diện sáng/tối được giữ khi chuyển trang trong cùng phiên trình duyệt.

Vercel dùng thư mục `dist`, preset Other, bỏ qua build và cài đặt. `vercel.json` lưu sẵn cấu hình này.

## Bổ sung mô hình sau này

Danh mục nằm tại `dist/catalog.js`. Mỗi mục chỉ định tên, mô tả, ảnh `preview`, file hình học `meta` và `binary`, cùng trạng thái `ready`. Khi có dữ liệu thật, thay đường dẫn dữ liệu và ảnh của mục đó, đặt `ready: true`; Home và trình xem dùng chung cấu hình.

`scripts/build-demos.mjs` tạo lại ba mô hình minh họa từ các khối cơ khí bằng Three.js. Các file trong `dist/assets/demo` chỉ dùng để chờ thay bằng dữ liệu CAD thực tế. Hình thu nhỏ trong `dist/assets/previews` được chụp từ các trình xem tương ứng.

`scripts/build-overview.mjs` là công cụ tạo bản minh họa cũ trong `dist/assets/demo`, không phải bản lắp CAD. Mục tổng quan hiện dùng `dist/assets/cad/tong-quan.json` và `.bin`, tạo bằng `scripts/convert-vehicle.mjs overview`; không sử dụng dữ liệu minh họa cũ.

## Cập nhật CAD thùng chính

Trên máy có SolidWorks, chạy `scripts/export-solidworks.ps1` bằng Windows PowerShell 5.1 với `-SourcePath` trỏ tới assembly và `-StepPath` trỏ tới file STEP mới. Script mở chỉ đọc khi cần, xuất theo cấu hình hiện tại, lưu thông tin part vào `.cache/thung-chinh-components.json` và kiểm tra assembly gốc không bị thay đổi. Nó không ghi đè STEP đã có và không đóng các tài liệu đã mở trước đó.

Sau đó chạy `node scripts/inspect-cad.mjs <STEP> thung-chinh` và `node scripts/convert-main.mjs <STEP>`. File khối 3D của thùng chính nằm ở `dist/assets/cad/thung-chinh.json` và `.bin`. `convert-main.mjs` gắn tên part dựa trên tên cụm trong STEP và hộp bao của các component SolidWorks; không có part đang bật nào bị bỏ qua. Chụp lại ảnh xem trước khi cập nhật dữ liệu CAD. Muốn cập nhật tổng quan, xuất lại bản lắp toàn xe theo quy trình bên dưới.

## Cập nhật thân xe và tổng quan

Xuất `Full_09_10_2.SLDASM` ở cấu hình hiện tại sang `.cache/Full_09_10_2.step`. Trong cấu hình đã nhận, các cụm thùng đang ẩn nên STEP này chỉ chứa cabin và khung gầm. Để xuất bản đầy đủ, chạy lại `scripts/export-solidworks.ps1` với STEP đích `.cache/Full_09_10_2-all.step`, `-ComponentInfoPath .cache/full-vehicle-components.json` và `-IncludeHiddenComponents`. Tùy chọn này làm việc trên bản sao assembly tạm, ghi nhận trạng thái ẩn của từng component trước khi hiện toàn bộ để xuất; không ghi thay đổi vào file gốc. Chọn tên đích mới nếu STEP hoặc bản sao đã tồn tại.

Chạy lần lượt:

```sh
node --max-old-space-size=4096 scripts/inspect-cad.mjs .cache/Full_09_10_2.step than-xe
node --max-old-space-size=4096 scripts/inspect-cad.mjs .cache/Full_09_10_2-all.step full-vehicle
node scripts/convert-vehicle.mjs chassis
node scripts/convert-vehicle.mjs overview
node scripts/verify-vehicle.mjs
```

Converter đối chiếu tên và hộp bao với thông tin component, dừng nếu thiếu part trong bản xuất, và giữ cả các bản sao chi tiết trùng vị trí. Không đổi tỷ lệ hay tự bố trí lại các cụm. Kiểm tra đối chiếu buffer với dữ liệu STEP đã nhập xác nhận sai số do Float32 dưới 0,001 mm. Ảnh Home phải được chụp lại từ hai trình xem dữ liệu thật. File CAD và dữ liệu trung gian chỉ nằm cục bộ trong `.cache`; website chỉ nhận JSON và buffer hình học đã chuyển đổi.

## Chức năng

- Xoay, pan, zoom; bốn góc nhìn; vừa khung; tự xoay.
- Chọn chi tiết từ hình 3D hoặc danh sách; tìm theo tên có/không dấu; ẩn/hiện từng chi tiết và nhóm.
- Cô lập, phóng tới chi tiết; xem mã gốc và kích thước bao.
- Bung lắp ráp theo thanh trượt, chuyển động minh họa, ẩn vỏ, bật/tắt cạnh.
- Giao diện sáng/tối, lưu ảnh PNG, giao diện điện thoại, điều khiển bàn phím và giảm chuyển động.

## Nguồn dữ liệu và giới hạn

122 mesh, 69 tên chi tiết khác nhau, 90.542 tam giác, nhập STEP bằng occt-import-js / OpenCascade. Lưu tên gốc và vị trí lắp; đổi trục trực chuẩn và đơn vị để hiển thị. Không có chi tiết cơ khí tự vẽ thay thế.

Kích thước trên giao diện là kích thước bao theo trục mô hình sau chia lưới, làm tròn mm; không phải kích thước chế tạo, chiều dài theo trục riêng hay dung tích. Độ lệch tuyến tính chia lưới được đặt 0,5 mm. Phân loại thành 7 nhóm để khám phá dựa trên tên part, không thay thế cây lắp gốc. Chế độ bung là dịch chuyển minh họa phục vụ quan sát, không phải mô phỏng động học, trình tự tháo lắp hoặc kiểm tra va chạm.

File CAD gốc không bị sửa và không nằm trong website. Dữ liệu thùng phụ nằm ở `dist/assets/model.json` và `model.bin`; thùng chính, thân xe và tổng quan nằm trong `dist/assets/cad`.

## Tái tạo dữ liệu

Cài phụ thuộc trong package.json, chạy `node scripts/inspect-step.mjs` rồi `node scripts/convert.mjs`. Script đọc STEP ở thư mục cha; lưu file trung gian vào `.cache` (không đưa vào nguồn xuất bản). Mã SHA-256 của nguồn được lưu trong model.json.

## Ghi công

- Ý tưởng trình bày: Anatomy, wheresryan22, MIT. Không sử dụng thư viện hình học của Anatomy vì cần giữ hình học CAD gốc.
- Three.js, MIT: `dist/vendor/THREE-LICENSE.txt`.
- occt-import-js: chỉ dùng trong bước chuyển đổi cục bộ; không đưa OpenCascade/WASM lên web.
- Font Be Vietnam Pro từ Google Fonts; trình duyệt dùng Arial nếu không có mạng.
