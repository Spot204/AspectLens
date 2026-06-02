import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export default function ExportFile({ data }) {
  const handleExportExcel = () => {
    if (!data || data.length === 0) return;

    // ÉP CẤU TRÚC: Chỉ lấy đúng 2 trường thông tin theo đúng yêu cầu đề bài
    const formattedRows = data.map((item) => ({
      "Comment": item.text,      // Cột 1: Nội dung câu đánh giá
      "Nhãn dán": item.sentiment // Cột 2: Nhãn AI dán (Tích cực/Tiêu cực/Trung tính)
    }));

    // ĐÓNG GÓI SANG FILE EXCEL BIẾN NHỊ PHÂN
    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kết quả dán nhãn");

    // Định dạng chiều rộng cột cho đẹp mắt (Cột comment cho rộng hẳn ra để dễ đọc)
    worksheet['!cols'] = [
      { wch: 65 }, // Chiều rộng cột Comment
      { wch: 20 }  // Chiều rộng cột Nhãn dán
    ];

    // Tạo lệnh download tự động cho trình duyệt
    XLSX.writeFile(workbook, `AspectLens_Output_Labels_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <button
      onClick={handleExportExcel}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium py-2 px-4 rounded-xl border border-emerald-700 shadow-sm transition-all text-sm"
    >
      <Download className="w-4 h-4" />
      Xuất file kết quả 2 cột (.xlsx)
    </button>
  );
}