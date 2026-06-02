import { useState } from 'react';
import { analyzeSingleText } from '../services/api';
import { MessageSquare, Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Ban } from 'lucide-react';

// =======================================================================
// THUẬT TOÁN TIỀN XỬ LÝ (FRONTEND HEURISTICS)
// =======================================================================
const isInvalidText = (text) => {
  const cleanText = text.trim().toLowerCase();
  
  if (cleanText.length < 2) return true;
  
  const validShortWords = ['ok', 'ko', 'dc', 'đc', 'tệ', 'ổn'];
  if (validShortWords.includes(cleanText)) return false; 

  if (!cleanText.includes(' ') && cleanText.length > 12) return true;
  if (/(.)\1{4,}/.test(cleanText)) return true;
  
  const hasVowel = /[aeiouyàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ]/i.test(cleanText);
  if (cleanText.length > 3 && !hasVowel) return true;

  return false; 
};

export default function SingleInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLiveTest = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    // 🛑 LỚP BẢO VỆ 1: CHẶN RÁC BẰNG REGEX (Không gọi API)
    if (isInvalidText(text)) {
      setResult({
        text: text,
        sentiment: "Không hợp lệ",
        probs: { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 },
        aspects: []
      });
      setLoading(false);
      return; // Cắt đứt luồng chạy, API không bị gọi dư thừa
    }

    try {
      // Dữ liệu sạch, bắt đầu cấp phép gọi API
      const data = await analyzeSingleText(text);
      
      const currentProbs = data.emotion?.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };
      
      // 🛑 LỚP BẢO VỆ 2: ĐO LƯỜNG NGƯỠNG PHÂN TÁN XÁC SUẤT (THRESHOLD)
      const maxConfidence = Math.max(
        currentProbs["Tích cực"], 
        currentProbs["Trung tính"], 
        currentProbs["Tiêu cực"]
      );

      let finalSentiment = data.emotion?.label || 'Trung tính';
      
      // Nếu AI trả về xác suất dàn đều (Max < 45%), chứng tỏ nó đang đoán mò do dữ liệu nhiễu
      if (maxConfidence > 0 && maxConfidence < 0.45) {
        finalSentiment = "Không hợp lệ";
      }

      setResult({
        text: data.aspect?.sentence || text,
        sentiment: finalSentiment,
        probs: currentProbs,
        aspects: data.aspect?.results || [],
      });

    } catch (err) {
      console.warn("Lỗi API, chạy Mock Data...");
      setResult({
        text: text,
        sentiment: "Lỗi kết nối",
        probs: { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 },
        aspects: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình giao diện (Thêm màu Xám Đá cho nhãn Không hợp lệ)
  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'Tích cực':
        return { cardBg: 'bg-green-50/40 border-green-100', badge: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> };
      case 'Tiêu cực':
        return { cardBg: 'bg-red-50/40 border-red-100', badge: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
      case 'Không hợp lệ':
        return { cardBg: 'bg-stone-50 border-stone-200', badge: 'bg-stone-200 text-stone-600 line-through', icon: <Ban className="w-5 h-5 text-stone-500" /> };
      default:
        return { cardBg: 'bg-gray-50 border-gray-100', badge: 'bg-gray-200 text-gray-800', icon: <HelpCircle className="w-5 h-5 text-gray-600" /> };
    }
  };

  const getAspectStyle = (polarity) => {
    if (polarity === 'positive') return 'bg-green-100 text-green-800 border-green-200';
    if (polarity === 'negative') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const translateSentiment = (sentiment) => {
    if (sentiment === 'positive') return 'Tích cực';
    if (sentiment === 'negative') return 'Tiêu cực';
    if (sentiment === 'neutral') return 'Trung tính';
    return sentiment;
  };

  const config = result ? getSentimentConfig(result.sentiment) : null;
  const probs = result?.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">Thử nghiệm AI nhanh (Live Demo ABSA)</h3>
        </div>

        <form onSubmit={handleLiveTest} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập câu đánh giá... (Hệ thống có bộ lọc chống gõ bừa)"
            className="w-full h-24 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all"
          />

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-all text-sm shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Hệ thống đang phân tích...' : 'Kiểm tra kết quả tức thì'}
          </button>
        </form>
      </div>

      {/* KHU VỰC HIỂN THỊ CHI TIẾT KẾT QUẢ ĐƠN LẺ */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex-1 flex flex-col justify-center min-h-[160px]">
        {result ? (
          <div className={`p-4 rounded-xl border ${config.cardBg} space-y-3.5 transition-colors`}>
            
            {/* Hàng đầu: Nhãn chính */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.icon}
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Đánh giá tổng quan:</span>
              </div>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${config.badge}`}>
                {result.sentiment}
              </span>
            </div>
            
            {/* Câu chữ gốc */}
            <p className="text-sm text-gray-800 italic font-medium bg-white/80 p-2.5 rounded-lg border border-white shadow-sm">
              "{result.text}"
            </p>

            {/* Chỉ render Khía cạnh chi tiết và Thanh xác suất nếu dữ liệu Hợp lệ */}
            {result.sentiment !== "Không hợp lệ" && result.sentiment !== "Lỗi kết nối" && (
              <>
                {/* Khía cạnh chi tiết (Aspects) */}
                {result.aspects && result.aspects.length > 0 && (
                  <div className="space-y-2 border-t border-gray-200/40 pt-2">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Chi tiết {result.aspects.length} khía cạnh bóc tách:</span>
                    <div className="space-y-1.5">
                      {result.aspects.map((aspectObj, i) => {
                        const name = (aspectObj.aspect || '').replace(/_/g, ' ');
                        const sentiment = aspectObj.sentiment || 'neutral';
                        const aspScore = aspectObj.aspect_score || 0;
                        const sentConf = aspectObj.sentiment_confidence || 0;
                        
                        return (
                          <div key={i} className={`text-xs border rounded-lg p-2 ${getAspectStyle(sentiment)}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold capitalize">{name}</span>
                              <span className="text-[10px] font-semibold">{translateSentiment(sentiment)}</span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[10px]">
                                <span>Điểm: {(aspScore * 100).toFixed(1)}%</span>
                                <div className="w-16 bg-gray-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full" style={{ width: `${Math.min(aspScore * 100, 100)}%` }} />
                                </div>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span>Tự tin: {(sentConf * 100).toFixed(1)}%</span>
                                <div className="w-16 bg-gray-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full" style={{ width: `${Math.min(sentConf * 100, 100)}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Thanh phân phối xác suất */}
                <div className="space-y-1 pt-1 border-t border-gray-200/40">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Xác suất phân phối cảm xúc:</span>
                  <div className="grid grid-cols-3 gap-3 text-[11px]">
                    <div>
                      <div className="flex justify-between text-gray-500 mb-0.5"><span>Tích cực</span><span className="font-bold text-green-600">{(probs["Tích cực"] * 100).toFixed(1)}%</span></div>
                      <div className="w-full bg-gray-200/60 h-1 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${probs["Tích cực"] * 100}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-gray-500 mb-0.5"><span>Trung tính</span><span className="font-bold text-gray-600">{(probs["Trung tính"] * 100).toFixed(1)}%</span></div>
                      <div className="w-full bg-gray-200/60 h-1 rounded-full overflow-hidden"><div className="bg-gray-400 h-full" style={{ width: `${probs["Trung tính"] * 100}%` }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-gray-500 mb-0.5"><span>Tiêu cực</span><span className="font-bold text-red-600">{(probs["Tiêu cực"] * 100).toFixed(1)}%</span></div>
                      <div className="w-full bg-gray-200/60 h-1 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{ width: `${probs["Tiêu cực"] * 100}%` }} /></div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-400 flex flex-col items-center justify-center border border-dashed border-gray-100 rounded-xl bg-gray-50/40">
            <ArrowRight className="w-4 h-4 mb-1 text-gray-300 animate-pulse" />
            Kết quả phân tích sắc thái khía cạnh chi tiết sẽ hiển thị tại đây
          </div>
        )}
      </div>
    </div>
  );
}