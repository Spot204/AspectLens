import { useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';

export default function ImportFile({ setAnalyticsData, setIsLoading }) {
  const [step, setStep] = useState(1); // 1: Chọn file, 2: Sẵn sàng/Chạy tiến trình
  const [fileData, setFileData] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = (event) => {
      const buffer = event.target.result;
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet);

      if (jsonRows.length > 0) {
        setFileData(jsonRows);
        // TỰ ĐỘNG nhận diện cột đầu tiên làm cột Comment
        const firstColumnName = Object.keys(jsonRows[0])[0];
        setTargetColumn(firstColumnName);
        setStep(2); // Nhảy thẳng sang bước sẵn sàng chạy
      } else {
        alert("File Excel trống, không tìm thấy dữ liệu!");
      }
    };
  };

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setProgress(10); // Bật thanh tiến trình ảo ban đầu
  
    // 1. Dùng hàm map của Javascript gom tất cả comment trong file thành 1 mảng chữ trần trụi
    // fileData là dữ liệu JSON mà thư viện SheetJS đã bóc tách sẵn từ file Excel cho bạn
    const cleanArrayOfComments = fileData.map(row => row[targetColumn] || '');
  
    try {
      // 2. BẮN MẢNG CHỮ NÀY QUA ĐƯỜNG ỐNG CÁCH 2 SANG BACKEND
      const apiResponseData = await analyzeFileBatchJSON(cleanArrayOfComments);
      
      // 3. ĐỔ DỮ LIỆU SẠCH VÀO KHO TỔNG ĐỂ BIỂU ĐỒ VÀ RESULT CARD TỰ CO GIÃN HIỂN THỊ
      setAnalyticsData(apiResponseData);
      setProgress(100); // Đẩy tiến trình lên đỉnh hoàn thành
    } catch (err) {
      console.error("Lỗi kết nối hoặc xử lý dữ liệu mạng:", err);
      alert("Không thể kết nối với server AI, vui lòng kiểm tra lại đường link ngrok!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetImport = () => {
    setStep(1);
    setFileData([]);
    setTargetColumn('');
    setProgress(0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[230px]">
      <div className="flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phân tích tệp Excel hàng loạt</h3>
      </div>

      {/* BƯỚC 1: TẢI FILE EXCEL 1 CỘT */}
      {step === 1 && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl p-6 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/10 transition-all group flex-1">
          <FileSpreadsheet className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
          <span className="text-sm font-medium text-gray-600">Chọn file Excel chứa cột Comment</span>
          <span className="text-xs text-gray-400 mt-1">Hệ thống sẽ tự bóc tách dữ liệu ngay tức thì</span>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {/* BƯỚC 2: SẴN SÀNG CHẠY VÀ THANH TIẾN TRÌNH */}
      {step === 2 && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {progress === 0 ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Đã nạp thành công cột <span className="font-bold text-indigo-600">"{targetColumn}"</span> với <span className="font-bold text-gray-800">{fileData.length}</span> dòng comment.
              </p>
              <div className="flex gap-2">
                <button onClick={resetImport} className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Hủy</button>
                <button onClick={handleStartAnalysis} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm">
                  <Play className="w-4 h-4" /> Kích hoạt mô hình AI dán nhãn
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">{progress < 100 ? 'AI đang xử lý dán nhãn...' : 'Hoàn thành bóc tách!'}</span>
                <span className="text-indigo-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              {progress === 100 && (
                <button onClick={resetImport} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                  <CheckCircle className="w-4 h-4" /> Tải tiếp file khác
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}