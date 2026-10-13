// Each entry owns its route, description, preview and model data.
// Set ready:true and replace the assets when the user's CAD model is supplied.
export const modules = [
 {id:'thung-phu',number:'01',title:'Thùng phụ',subtitle:'Tiếp nhận & cơ cấu ép',ready:true,preview:'./assets/previews/thung-phu.png',meta:'./assets/model.json',binary:'./assets/model.bin',
  description:'Khám phá cụm thùng phụ từ bản lắp SolidWorks của bạn. Quan sát vỏ và máng thùng, bàn ép, bàn cào, hệ xi lanh, nắp thùng và các ray trượt tại vị trí lắp ráp.',
  details:['122 chi tiết từ mô hình STEP','Chọn từng part, ẩn vỏ và xem riêng chi tiết','Bung lắp ráp để quan sát kết cấu'],tags:['Vỏ & máng thùng','Bàn ép / bàn cào','Xi lanh & ray trượt'],previewLabel:'MÔ HÌNH CỦA BẠN',status:'Đã có mô hình',action:'Khám phá 3D'},
 {id:'thung-chinh',number:'02',title:'Thùng chính',subtitle:'Khoang chứa & kết cấu thùng',ready:false,preview:'./assets/previews/thung-chinh.png',meta:'./assets/demo/thung-chinh.json',binary:'./assets/demo/thung-chinh.bin',
  description:'Khu vực dành cho cụm thùng chính: khoang chứa, các vách, sàn, khung gia cường và các chi tiết liên kết. Khi bạn cung cấp bản lắp, trang này sẽ hiển thị đúng kết cấu và danh sách chi tiết của cụm.',
  details:['Hình minh họa khoang thùng và khung đỡ','Đã chuẩn bị trình xem và danh sách chi tiết','Chờ mô hình STEP của thùng chính'],tags:['Khoang chứa','Vách & sàn','Khung gia cường'],previewLabel:'MINH HỌA 3D',status:'Chờ mô hình',action:'Xem minh họa 3D'},
 {id:'than-xe',number:'03',title:'Thân xe',subtitle:'Khung gầm & nền tảng lắp đặt',ready:false,preview:'./assets/previews/than-xe.png',meta:'./assets/demo/than-xe.json',binary:'./assets/demo/than-xe.bin',
  description:'Khu vực dành cho thân xe và khung gầm, thể hiện mối liên hệ giữa cabin, hệ khung, các cầu và bánh xe. Mô hình của bạn sẽ được bổ sung để khám phá các vị trí liên kết với những cụm thùng.',
  details:['Hình minh họa cabin, khung gầm và bánh xe','Có thể xoay, chọn và tách các bộ phận minh họa','Chờ bản lắp thân xe thực tế'],tags:['Cabin','Khung gầm','Cầu & bánh xe'],previewLabel:'MINH HỌA 3D',status:'Chờ mô hình',action:'Xem minh họa 3D'},
 {id:'cap-nang',number:'04',title:'Cặp nâng thùng rác',subtitle:'Cơ cấu nâng & liên kết',ready:false,preview:'./assets/previews/cap-nang.png',meta:'./assets/demo/cap-nang.json',binary:'./assets/demo/cap-nang.bin',
  description:'Khu vực dành cho cặp nâng thùng rác: tay nâng, giá đỡ, trục liên kết và các bộ phận truyền động. Hình hiện tại minh họa ý tưởng cấu tạo; hình dạng thực tế sẽ được cập nhật từ bản lắp bạn cung cấp.',
  details:['Hình minh họa cặp tay nâng và thùng rác','Đã có không gian khám phá chi tiết riêng','Chờ mô hình cặp nâng của bạn'],tags:['Tay nâng','Giá & trục liên kết','Bộ phận truyền động'],previewLabel:'MINH HỌA 3D',status:'Chờ mô hình',action:'Xem minh họa 3D'}
];
export const moduleUrl = id => `./explorer.html?module=${encodeURIComponent(id)}`;
