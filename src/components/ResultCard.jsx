import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function ResultCard({ item }) {
  // 1. Cấu hình màu sắc chủ đạo theo nhãn tổng quan
  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'Tích cực':
        return {
          bg: 'bg-white border-green-200 hover:shadow-green-50',
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
        };
      case 'Tiêu cực':
        return {
          bg: 'bg-white border-red-200 hover:shadow-red-50',
          badge: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />
        };
      default:
        return {
          bg: 'bg-white border-gray-200 hover:shadow-gray-50',
          badge: 'bg-gray-100 text-gray-800',
          icon: <HelpCircle className="w-5 h-5 text-gray-600" />
        };
    }
  };

  // Hàm đổi màu riêng cho từng khía cạnh nhỏ bên trong
  const getAspectBadgeStyle = (polarity) => {
    if (polarity === 'Tích cực' || polarity === 'positive') return 'bg-green-50 text-green-700 border-green-200';
    if (polarity === 'Tiêu cực' || polarity === 'negative') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const config = getSentimentConfig(item.sentiment);
  const probs = item.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };

  return (
    <div className={`p-5 rounded-xl border ${config.bg} transition-all shadow-sm space-y-4 hover:shadow-md`}>
      
      {/* PHẦN 1: CÂU ĐÁNH GIÁ GỐC & NHÃN CHÍNH */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <p className="text-gray-800 font-semibold text-base leading-relaxed">
            "{item.text}"
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${config.badge}`}>
          {item.sentiment}
        </span>
      </div>

      <hr className="border-gray-100" />

      {/* PHẦN 2: HIỂN THỊ CÁC KHÍA CẠNH ĐÃ BÓC TÁCH (ASPECTS) */}
      {item.aspects && item.aspects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Khía cạnh chi tiết phát hiện được:</h4>
          <div className="flex flex-wrap gap-2">
            {item.aspects.map((aspectObj, idx) => {
              // Hỗ trợ đọc cả key tiếng Anh lẫn tiếng Việt tùy ông backend trả về
              const aspectName = aspectObj.aspect || aspectObj.khia_canh || "Khía cạnh";
              const aspectPolarity = aspectObj.polarity || aspectObj.sentiment || "Trung tính";
              
              return (
                <div key={idx} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${getAspectBadgeStyle(aspectPolarity)}`}>
                  <span className="font-semibold">{aspectName}:</span>
                  <span>{aspectPolarity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHẦN 3: BẢNG PHÂN PHỐI XÁC SUẤT (PROBS PROGESS BAR) */}
      <div className="space-y-1.5 pt-1">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trọng số phân phối xác suất AI:</h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {/* Cột Tích cực */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Tích cực</span>
              <span className="font-bold text-green-600">{(probs["Tích cực"] * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: `${probs["Tích cực"] * 100}%` }} />
            </div>
          </div>

          {/* Cột Trung tính */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Trung tính</span>
              <span className="font-bold text-gray-600">{(probs["Trung tính"] * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gray-400 h-full" style={{ width: `${probs["Trung tính"] * 100}%` }} />
            </div>
          </div>

          {/* Cột Tiêu cực */}
          <div className="space-y-1">
            <div className="flex justify-between text-gray-500">
              <span>Tiêu cực</span>
              <span className="font-bold text-red-600">{(probs["Tiêu cực"] * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${probs["Tiêu cực"] * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}