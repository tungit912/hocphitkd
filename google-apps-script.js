/**
 * Google Apps Script for Taekwondo Training Registration (7 Columns)
 * 
 * Columns A-G:
 * A: TT (Số thứ tự)
 * B: Họ và tên
 * C: Điện thoại
 * D: Mã Thanh toán
 * E: Trạng thái
 * F: Email
 * G: Số tiền
 */

const SPREADSHEET_ID = '1dKZhXp42uEqw5wLKrTRIsedffBnVvhzXnbL0Zx3nnQA';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0]; // Lấy sheet đầu tiên
    
    // Lấy số thứ tự tiếp theo (TT)
    const lastRow = sheet.getLastRow();
    const nextTT = lastRow > 0 ? lastRow : 1; 
    
    // Thêm dữ liệu vào các cột từ A đến G
    sheet.appendRow([
      nextTT,               // A: TT
      data.fullName,        // B: Họ và tên
      data.phone,           // C: Điện thoại
      data.paymentCode,     // D: Mã Thanh toán
      'Chờ thanh toán',     // E: Trạng thái
      data.email,           // F: Email
      data.amount           // G: Số tiền
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Hệ thống đồng bộ CLB Taekwondo Xuân Phương đang hoạt động.");
}
