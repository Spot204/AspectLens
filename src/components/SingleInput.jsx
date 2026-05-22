import { useState } from 'react';
import { analyzeSingleText } from '../services/api';
import { MessageSquare, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';

export default function SingleInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Lưu kết quả ĐỘC LẬP cho riêng câu test này

  const handleLiveTest = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResult(null); // Xóa kết quả cũ trước khi test câu mới

    try {
      // Gọi API thật lên Backend
      const data = await analyzeSingleText(text);
      setResult(data);
    } catch (err) {
      // Nếu chưa có backend, tự động kích hoạt Mock Data để khách hàng trải nghiệm thử giao diện
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let sentiment = 'Trung tính';
        let keywords = [];

        if (lowerText.includes('tệ') || lowerText.includes('chán') || lowerText.includes('hỏng') || lowerText.includes('kém')) {
          sentiment = 'Tiêu cực';
          keywords = ['tệ', 'chán', 'hỏng', 'kém'].filter(w => lowerText.includes(w));
        } else if (lowerText.includes('tốt') || lowerText.includes('ngon') || lowerText.includes('tuyệt') || lowerText.includes('mượt')) {
          sentiment = 'Tích cực';
          keywords = ['tốt', 'ngon', 'tuyệt', 'mượt'].filter(w => lowerText.includes(w));
        }

        setResult({
          text: text,
          sentiment: sentiment,
          confidence: (Math.random() * (0.99 - 0.75) + 0.75).toFixed(2),
          keywords: keywords.length > 0 ? keywords : ['ngữ cảnh']
        });
        setLoading(false);
      }, 500); // Tạo độ trễ nửa giây cho giống AI đang suy nghĩ thật
    } finally {
      if (loading) setLoading(false);
    }
  };

  // Cấu hình màu sắc giao diện tương ứng với kết quả trả về của AI
  const getBadgeStyle = (sentiment) => {
    switch (sentiment) {
      case 'Tích cực':
        return {
          cardBg: 'bg-green-50/60 border-green-100',
          badge: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />
        };
      case 'Tiêu cực':
        return {
          cardBg: 'bg-red-50/60 border-red-100',
          badge: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />
        };
      default:
        return {
          cardBg: 'bg-gray-50 border-gray-100',
          badge: 'bg-gray-200 text-gray-800',
          icon: <HelpCircle className="w-5 h-5 text-gray-600" />
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Thử nghiệm AI nhanh (Live Demo)</h3>
        </div>

        <form onSubmit={handleLiveTest} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập hoặc dán một câu đánh giá bất kỳ để test thử trí thông minh của AI... (Ví dụ: Máy dùng mượt nhưng pin hơi tụt nhanh)"
            className="w-full h-28 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all"
          />

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-all text-sm shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'AI đang phân tích dữ liệu...' : 'Kiểm tra kết quả tức thì'}
          </button>
        </form>
      </div>

      {/* CHỨC NĂNG HIỂN THỊ ĐƠN LẺ NGAY TẠI CHỖ */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex-1 flex flex-col justify-center min-h-[90px]">
        {result ? (
          (() => {
            const style = getBadgeStyle(result.sentiment);
            return (
              <div className={`p-3.5 rounded-lg border ${style.cardBg} space-y-2 animate-fadeIn`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {style.icon}
                    <span className="text-xs text-gray-500 font-medium">Kết quả phân tích:</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {result.sentiment} ({Math.round(result.confidence * 100)}%)
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 italic font-medium bg-white/50 p-2 rounded border border-white">
                  "{result.text}"
                </p>

                {result.keywords && result.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[11px] text-gray-400">Trọng số từ khóa:</span>
                    {result.keywords.map((kw, i) => (
                      <span key={i} className="text-[11px] bg-white px-1.5 py-0.2 rounded border text-gray-600 font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="text-center py-4 text-xs text-gray-400 flex flex-col items-center justify-center border border-dashed border-gray-100 rounded-lg bg-gray-50/30">
            <ArrowRight className="w-4 h-4 mb-1 text-gray-300" />
            Kết quả test đơn lẻ của khách hàng sẽ hiển thị ngay tại khung này
          </div>
        )}
      </div>
    </div>
  );
}