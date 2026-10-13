// Each entry owns its route, description, preview and model data.
// Set ready:true and replace the assets when the user's CAD model is supplied.
export const modules = [
 {id:'tong-quan',number:'00',title:'Tổng quan về xe',subtitle:'Toàn xe & liên kết các cụm',ready:false,overview:true,camera:[6,3.8,7],preview:'./assets/previews/tong-quan.png',meta:'./assets/demo/tong-quan.json',binary:'./assets/demo/tong-quan.bin',
  description:'Quan sát chiếc xe khi thân xe, thùng chính, thùng phụ và cặp nâng thùng rác cùng nằm trong một mô hình tổng thể. Bản hiện tại minh họa vị trí tương đối của các cụm; mô hình lắp ráp thực tế sẽ được bổ sung khi bạn cung cấp đầy đủ dữ liệu.',
  details:['Tổng thể gồm đủ bốn cụm thành phần','Chọn một bộ phận để mở trang của cụm tương ứng','Chờ bản lắp tổng thể của xe'],tags:['Thân xe','Thùng chính & thùng phụ','Cặp nâng thùng rác'],previewLabel:'MINH HỌA LẮP RÁP',status:'Chờ mô hình',action:'Khám phá toàn xe'},
 {id:'thung-phu',number:'01',title:'Thùng phụ',subtitle:'Tiếp nhận & cơ cấu ép',ready:true,preview:'./assets/previews/thung-phu.png',meta:'./assets/model.json',binary:'./assets/model.bin',
  description:'Khám phá cụm thùng phụ từ bản lắp SolidWorks của bạn. Quan sát vỏ và máng thùng, bàn ép, bàn cào, hệ xi lanh, nắp thùng và các ray trượt tại vị trí lắp ráp.',
  details:['122 chi tiết từ mô hình STEP','Chọn từng part, ẩn vỏ và xem riêng chi tiết','Bung lắp ráp để quan sát kết cấu'],tags:['Vỏ & máng thùng','Bàn ép / bàn cào','Xi lanh & ray trượt'],previewLabel:'MÔ HÌNH CỦA BẠN',status:'Đã có mô hình',action:'Khám phá 3D'},
 {id:'thung-chinh',number:'02',title:'Thùng chính',subtitle:'Khoang chứa, bàn xả & khung phụ',ready:true,geometryNoun:'khối hình học',preview:'./assets/previews/thung-chinh.png',meta:'./assets/cad/thung-chinh.json',binary:'./assets/cad/thung-chinh.bin',
  description:'Khám phá cụm thùng chính từ bản lắp SolidWorks của bạn, gồm các vách, sàn, mui, khung thùng, bàn xả, thanh trượt, khung phụ, cầu thang và thùng dầu. Hình học và vị trí các bộ phận được lấy từ cấu hình lắp hiện tại.',
  details:['74 khối hình học từ 12 part đang bật trong bản lắp','Chọn, ẩn và xem riêng từng bộ phận','Có bàn xả, khung phụ và các phụ kiện đi kèm'],tags:['Vách, sàn & mui','Bàn xả & thanh trượt','Khung phụ & phụ kiện'],previewLabel:'MÔ HÌNH CỦA BẠN',status:'Đã có mô hình',action:'Khám phá 3D'},
 {id:'than-xe',number:'03',title:'Thân xe',subtitle:'Khung gầm & nền tảng lắp đặt',ready:false,preview:'./assets/previews/than-xe.png',meta:'./assets/demo/than-xe.json',binary:'./assets/demo/than-xe.bin',
  description:'Khu vực dành cho thân xe và khung gầm, thể hiện mối liên hệ giữa cabin, hệ khung, các cầu và bánh xe. Mô hình của bạn sẽ được bổ sung để khám phá các vị trí liên kết với những cụm thùng.',
  details:['Hình minh họa cabin, khung gầm và bánh xe','Có thể xoay, chọn và tách các bộ phận minh họa','Chờ bản lắp thân xe thực tế'],tags:['Cabin','Khung gầm','Cầu & bánh xe'],previewLabel:'MINH HỌA 3D',status:'Chờ mô hình',action:'Xem minh họa 3D'},
 {id:'cap-nang',number:'04',title:'Cặp nâng thùng rác',subtitle:'Cơ cấu nâng & liên kết',ready:false,preview:'./assets/previews/cap-nang.png',meta:'./assets/demo/cap-nang.json',binary:'./assets/demo/cap-nang.bin',
  description:'Khu vực dành cho cặp nâng thùng rác: tay nâng, giá đỡ, trục liên kết và các bộ phận truyền động. Hình hiện tại minh họa ý tưởng cấu tạo; hình dạng thực tế sẽ được cập nhật từ bản lắp bạn cung cấp.',
  details:['Hình minh họa cặp tay nâng và thùng rác','Đã có không gian khám phá chi tiết riêng','Chờ mô hình cặp nâng của bạn'],tags:['Tay nâng','Giá & trục liên kết','Bộ phận truyền động'],previewLabel:'MINH HỌA 3D',status:'Chờ mô hình',action:'Xem minh họa 3D'}
];
export const moduleUrl = id => `./explorer.html?module=${encodeURIComponent(id)}`;
