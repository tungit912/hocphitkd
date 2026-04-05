/**
 * Google Apps Script cho CLB Taekwondo Xuân Phương (9 Cột + Đọc số thành chữ)
 * 
 * Cấu trúc cột trong Google Sheet:
 * A: TT (Số thứ tự)
 * B: Họ và tên
 * C: Điện thoại
 * D: Mã Thanh toán
 * E: Trạng thái (Thanh toán)
 * F: Email
 * G: Gửi email (Trạng thái gửi thông báo)
 * H: Số tiền
 * I: Bằng chữ
 */

const SPREADSHEET_ID = '1dKZhXp42uEqw5wLKrTRIsedffBnVvhzXnbL0Zx3nnQA';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0]; 
    
    const lastRow = sheet.getLastRow();
    const nextTT = lastRow > 0 ? lastRow : 1; 
    
    let emailStatus = 'Chưa gửi';
    const amountInWords = docSoThanhChu(data.amount) + " đồng";
    
    // Gửi email thông báo cho học viên
    try {
      const subject = `[CLB Taekwondo Xuân Phương] Xác nhận thông tin nộp học phí - ${data.paymentCode}`;
      const body = `Chào ${data.fullName},\n\n` +
                   `Hệ thống đã ghi nhận thông tin nộp học phí của bạn:\n` +
                   `- Số tiền: ${new Intl.NumberFormat('vi-VN').format(data.amount)} VNĐ (${amountInWords})\n` +
                   `- Mã thanh toán: ${data.paymentCode}\n\n` +
                   `Vui lòng hoàn tất thanh toán bằng cách quét mã QR trên trang web hoặc chuyển khoản với nội dung là Mã thanh toán trên.\n\n` +
                   `Trân trọng,\nCLB Taekwondo Xuân Phương`;
      
      MailApp.sendEmail(data.email, subject, body);
      emailStatus = 'Đã gửi';
    } catch (mailError) {
      console.error('Lỗi gửi email: ' + mailError.toString());
      emailStatus = 'Lỗi: ' + mailError.toString();
    }
    
    // Thêm dữ liệu vào các cột từ A đến I
    sheet.appendRow([
      nextTT,               // A: TT
      data.fullName,        // B: Họ và tên
      data.phone,           // C: Điện thoại
      data.paymentCode,     // D: Mã Thanh toán
      'Chờ thanh toán',     // E: Trạng thái
      data.email,           // F: Email
      emailStatus,          // G: Gửi email
      data.amount,          // H: Số tiền
      amountInWords         // I: Bằng chữ
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', email: emailStatus, words: amountInWords }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Hệ thống đồng bộ CLB Taekwondo Xuân Phương đang hoạt động.");
}

/**
 * Hàm đọc số thành chữ tiếng Việt
 */
function docSoThanhChu(so) {
  if (so == 0) return "Không";
  var chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  var donVi = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  
  function doc3So(n, showZero) {
    var res = "";
    var tram = Math.floor(n / 100);
    var chuc = Math.floor((n % 100) / 10);
    var donvi = n % 10;
    
    if (tram > 0 || showZero) {
      res = chuSo[tram] + " trăm ";
      if (chuc == 0 && donvi != 0) res += "lẻ ";
    }
    
    if (chuc != 0) {
      if (chuc == 1) res += "mười ";
      else res += chuSo[chuc] + " mươi ";
    }
    
    if (donvi != 0) {
      if (chuc > 1 && donvi == 1) res += "mốt";
      else if (chuc > 0 && donvi == 5) res += "lăm";
      else res += chuSo[donvi];
    }
    return res.trim();
  }

  var res = "";
  var groups = [];
  var tempSo = so;
  while (tempSo > 0) {
    groups.push(tempSo % 1000);
    tempSo = Math.floor(tempSo / 1000);
  }
  
  for (var i = groups.length - 1; i >= 0; i--) {
    var g = doc3So(groups[i], i < groups.length - 1);
    if (g != "") {
      res += g + " " + donVi[i] + " ";
    }
  }
  
  res = res.trim();
  return res.charAt(0).toUpperCase() + res.slice(1);
}
