import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export default function ExportFile({ data }) {
  const handleExportExcel = () => {
    if (!data || data.length === 0) return;

    // KIẾN TRÚC DỮ LIỆU ĐẦU RA (3 CỘT CHUYÊN NGHIỆP)
    const formattedRows = data.map((item) => {
      
      // Tính toán lại độ tự tin cao nhất để xuất ra báo cáo
      const probs = item.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };
      const maxConf = Math.max(probs["Tích cực"], probs["Trung tính"], probs["Tiêu cực"]);
      
      // Xử lý logic hiển thị cho các dòng bị lỗi/bị chặn
      const isInvalid = item.sentiment === "Không hợp lệ" || item.sentiment === "Lỗi kết nối";
      const confidenceString = isInvalid ? "Bị chặn bởi hệ thống" : `${(maxConf * 100).toFixed(1)}%`;

      return {
        "Câu đánh giá gốc": item.text,
        "Nhãn phân loại AI": item.sentiment,
        "Độ tự tin AI (Max %)": confidenceString
      };
    });

    // ÉP KHUÔN SANG SHEETJS
    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kết quả bóc tách");

    // ĐỊNH DẠNG ĐỘ RỘNG CỘT CHO ĐẸP (Không bị đè chữ ####)
    worksheet['!cols'] = [
      { wch: 65 }, // Cột 1: Câu gốc (Rất rộng)
      { wch: 20 }, // Cột 2: Nhãn (Vừa phải)
      { wch: 25 }  // Cột 3: Độ tự tin (Vừa phải)
    ];

    XLSX.writeFile(workbook, `AI_Analytics_Output_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <button 
      onClick={handleExportExcel} 
      disabled={!data || data.length === 0} 
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium py-2 px-4 rounded-xl border border-emerald-700 shadow-sm transition-all text-sm"
    >
      <Download className="w-4 h-4" /> Xuất báo cáo Excel chi tiết
    </button>
  );
}