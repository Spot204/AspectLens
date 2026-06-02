import { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';

export default function ImportFile({ setAnalyticsData, setIsLoading }) {
  const [step, setStep] = useState(1); // 1: Chọn file, 2: Map cột, 3: Chạy tiến trình
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [progress, setProgress] = useState(0);

  // Bước 1: Xử lý đọc lướt file khi người dùng tải lên
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // Tự động lấy dòng đầu làm tiêu đề cột
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          setFileData(results.data);
          setHeaders(Object.keys(results.data[0])); // Lấy mảng tên các cột
          setStep(2); // Chuyển sang bước map cột
        } else {
          alert("File này không có dữ liệu!");
        }
      },
    });
  };

  // Bước 3: Giả lập/Xử lý gửi danh sách lên AI chấm điểm
  const handleStartAnalysis = async () => {
    if (!selectedColumn) return;

    setIsLoading(true);
    setStep(3);
    setProgress(0);

    const totalRows = fileData.length;
    const resultsBuffer = [];

    // Giả lập xử lý tiến trình cắt nhỏ dữ liệu (Chunking) để giao diện hiển thị mượt mà
    for (let i = 0; i < totalRows; i++) {
      const row = fileData[i];
      const textToAnalyze = row[selectedColumn] || '';

      // Giả lập thuật toán AI chấm điểm với cấu trúc mới
      const sentimentOptions = ['Tích cực', 'Tiêu cực', 'Trung tính'];
      const mockSentiment = textToAnalyze.includes('tệ') || textToAnalyze.includes('lỗi') 
        ? 'Tiêu cực' 
        : sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)];

      // Tạo mock aspects data theo cấu trúc thực tế
      const mockAspects = [
        {
          aspect: 'chat_luong',
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          aspect_score: Math.random() * (1 - 0.5) + 0.5,
          sentiment_confidence: Math.random() * (1 - 0.6) + 0.6
        },
        {
          aspect: 'giao_hang',
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          aspect_score: Math.random() * (1 - 0.5) + 0.5,
          sentiment_confidence: Math.random() * (1 - 0.6) + 0.6
        },
        {
          aspect: 'dich_vu',
          sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
          aspect_score: Math.random() * (1 - 0.5) + 0.5,
          sentiment_confidence: Math.random() * (1 - 0.6) + 0.6
        }
      ];

      resultsBuffer.push({
        text: textToAnalyze,
        sentiment: mockSentiment,
        probs: {
          "Tích cực": Math.random() * 0.5 + 0.2,
          "Trung tính": Math.random() * 0.3,
          "Tiêu cực": Math.random() * 0.4
        },
        aspects: mockAspects
      });

      // Cập nhật thanh tiến trình % thực tế
      if (i % Math.ceil(totalRows / 10) === 0 || i === totalRows - 1) {
        setProgress(Math.round(((i + 1) / totalRows) * 100));
        // Đợi một chút mili-giây để người dùng kịp nhìn thấy hiệu ứng chạy phần trăm
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    // Đẩy ngược toàn bộ mảng dữ liệu đã chấm điểm lên App.jsx để cập nhật Biểu đồ và Bảng danh sách
    setAnalyticsData(resultsBuffer);
    setIsLoading(false);
  };

  const resetImport = () => {
    setStep(1);
    setFileData([]);
    setHeaders([]);
    setSelectedColumn('');
    setProgress(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[230px]">
      <div className="flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phân tích dữ liệu lớn từ File</h3>
      </div>

      {/* BƯỚC 1: KÉO THẢ TẢI FILE */}
      {step === 1 && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl p-6 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/10 transition-all group flex-1">
          <FileSpreadsheet className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
          <span className="text-sm font-medium text-gray-600">Click hoặc kéo thả file CSV vào đây</span>
          <span className="text-xs text-gray-400 mt-1">Hệ thống tự động bóc tách cột dữ liệu</span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {/* BƯỚC 2: ÁNH XẠ CỘT (COLUMN MAPPING) */}
      {step === 2 && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Tìm thấy <span className="font-bold text-indigo-600">{fileData.length}</span> dòng. Chọn cột chứa nội dung bình luận:
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn cột dữ liệu --</option>
              {headers.map((header, idx) => (
                <option key={idx} value={header}>{header}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={resetImport} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg">Hủy</button>
            <button
              disabled={!selectedColumn}
              onClick={handleStartAnalysis}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-all"
            >
              <Play className="w-4 h-4" /> Bắt đầu chạy AI
            </button>
          </div>
        </div>
      )}

      {/* BƯỚC 3: THANH TIẾN TRÌNH REAL-TIME */}
      {step === 3 && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-600">{progress < 100 ? 'Hệ thống AI đang chấm điểm...' : 'Hoàn thành xuất sắc!'}</span>
            <span className="text-indigo-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && (
            <button onClick={resetImport} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" /> Tải tiếp file khác
            </button>
          )}
        </div>
      )}
    </div>
  );
}