import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';

export default function ResultCard({ item }) {
  // Hàm trả về màu sắc và icon tương ứng với từng sắc thái
  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'Tích cực':
        return {
          bg: 'bg-green-50 border-green-100',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
        };
      case 'Tiêu cực':
        return {
          bg: 'bg-red-50 border-red-100',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />
        };
      default: // Trung tính
        return {
          bg: 'bg-gray-50 border-gray-100',
          text: 'text-gray-700',
          badge: 'bg-gray-200 text-gray-800',
          icon: <HelpCircle className="w-5 h-5 text-gray-600" />
        };
    }
  };

  const config = getSentimentConfig(item.sentiment);
  const confidencePercentage = Math.round(item.confidence * 100);

  return (
    <div className={`p-4 rounded-xl border ${config.bg} transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">{config.icon}</div>
        <div className="space-y-1">
          {/* Nội dung câu đánh giá */}
          <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed">
            {item.text}
          </p>
          
          {/* Hiển thị từ khóa nếu backend có bóc tách (Aspect-Based) */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center pt-1">
              <span className="text-xs text-gray-500 mr-1">Từ khóa ngữ cảnh:</span>
              {item.keywords.map((kw, i) => (
                <span key={i} className="text-xs bg-white/80 border px-1.5 py-0.5 rounded text-gray-600 font-mono">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Khu vực thông số AI và hành động */}
      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-200/60">
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
            {item.sentiment}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Độ tin cậy: <span className="font-semibold text-gray-700">{confidencePercentage}%</span>
          </p>
        </div>

        {/* Nút hỗ trợ sửa nhãn nhanh bằng tay */}
        <button 
          onClick={() => alert("Chức năng sửa nhãn thủ công sẽ cập nhật lại mảng dữ liệu tổng!")}
          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
          title="Sửa nhãn dữ liệu"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}