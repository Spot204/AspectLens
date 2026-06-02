import { CheckCircle2, AlertTriangle, HelpCircle, Ban } from 'lucide-react';

export default function ResultCard({ item }) {
  const getSentimentConfig = (sentiment) => {
    switch (sentiment) {
      case 'Tích cực':
        return { bg: 'bg-white border-green-200 hover:shadow-green-50', badge: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> };
      case 'Tiêu cực':
        return { bg: 'bg-white border-red-200 hover:shadow-red-50', badge: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-5 h-5 text-red-600" /> };
      case 'Không hợp lệ':
      case 'Lỗi kết nối':
        return { bg: 'bg-stone-50 border-stone-200 opacity-80', badge: 'bg-stone-200 text-stone-600 line-through', icon: <Ban className="w-5 h-5 text-stone-500" /> };
      default: // Trung tính
        return { bg: 'bg-white border-gray-200 hover:shadow-gray-50', badge: 'bg-gray-100 text-gray-800', icon: <HelpCircle className="w-5 h-5 text-gray-600" /> };
    }
  };

  const getAspectBadgeStyle = (polarity) => {
    if (polarity === 'positive') return 'bg-green-50 text-green-700 border-green-200';
    if (polarity === 'negative') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const translateSentiment = (sentiment) => {
    if (sentiment === 'positive') return 'Tích cực';
    if (sentiment === 'negative') return 'Tiêu cực';
    if (sentiment === 'neutral') return 'Trung tính';
    return sentiment;
  };

  const config = getSentimentConfig(item.sentiment);
  const probs = item.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };
  const isInvalid = item.sentiment === 'Không hợp lệ' || item.sentiment === 'Lỗi kết nối';

  return (
    <div className={`p-5 rounded-xl border ${config.bg} transition-all shadow-sm space-y-4 hover:shadow-md`}>
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{config.icon}</div>
          <p className={`font-semibold text-base leading-relaxed ${isInvalid ? 'text-stone-500 italic' : 'text-gray-800'}`}>
            "{item.text}"
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${config.badge}`}>
          {item.sentiment}
        </span>
      </div>

      {/* NẾU LÀ RÁC HOẶC LỖI -> DỪNG VẼ UI TẠI ĐÂY (TRẢ VỀ NULL CHO PHẦN DƯỚI) */}
      {!isInvalid && (
        <>
          <hr className="border-gray-100" />

          {item.aspects && item.aspects.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phân tích chi tiết {item.aspects.length} khía cạnh:</h4>
              <div className="space-y-2">
                {item.aspects.map((aspectObj, idx) => {
                  const aspectName = (aspectObj.aspect || '').replace(/_/g, ' ');
                  const sentiment = aspectObj.sentiment || 'neutral';
                  const aspScore = aspectObj.aspect_score || 0;
                  const sentConf = aspectObj.sentiment_confidence || 0;
                  
                  return (
                    <div key={idx} className={`border rounded-lg p-3 space-y-2 ${getAspectBadgeStyle(sentiment)}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm capitalize">{aspectName}</span>
                        <span className="text-xs font-semibold">{translateSentiment(sentiment)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>Điểm khía cạnh</span>
                            <span className="font-bold">{(aspScore * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(aspScore * 100, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>Độ tự tin</span>
                            <span className="font-bold">{(sentConf * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
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

          <div className="space-y-1.5 pt-2 border-t border-gray-100/60 mt-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trọng số phân phối xác suất AI:</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-500"><span>Tích cực</span><span className="font-bold text-green-600">{(probs["Tích cực"] * 100).toFixed(1)}%</span></div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${probs["Tích cực"] * 100}%` }} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-gray-500"><span>Trung tính</span><span className="font-bold text-gray-600">{(probs["Trung tính"] * 100).toFixed(1)}%</span></div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-gray-400 h-full" style={{ width: `${probs["Trung tính"] * 100}%` }} /></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-gray-500"><span>Tiêu cực</span><span className="font-bold text-red-600">{(probs["Tiêu cực"] * 100).toFixed(1)}%</span></div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className="bg-red-500 h-full" style={{ width: `${probs["Tiêu cực"] * 100}%` }} /></div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}