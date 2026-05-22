import { Download } from 'lucide-react';

export default function ExportFile({ data }) {
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    // 1. Tạo hàng tiêu đề cho file xuất ra
    const headers = ['No dung danh gia', 'Sac thai AI', 'Do tin cay (%)'];
    
    // 2. Chuyển đổi dữ liệu đối tượng (Object) thành các hàng văn bản phân tách bằng dấu phẩy
    const rows = data.map((item, index) => [
      `"${item.text.replace(/"/g, '""')}"`, // Xử lý bọc dấu ngoặc kép nếu trong câu có dấu phẩy tránh vỡ file
      item.sentiment,
      `${Math.round(item.confidence * 100)}%`
    ]);

    // 3. Ghép hàng đầu và các hàng nội dung lại với nhau
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // 4. Kỹ thuật BOM (Byte Order Mark) bắt buộc phải có để Excel hiểu được đây là Tiếng Việt mã hóa UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 5. Tạo link ngầm độc lập trên DOM để ép trình duyệt tải xuống file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ASPECTLENS_KetQua_Sentiment_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:shadow-none text-white font-medium py-2 px-4 rounded-xl border border-emerald-700 shadow-sm transition-all text-sm"
    >
      <Download className="w-4 h-4" />
      Xuất file kết quả (.CSV)
    </button>
  );
}