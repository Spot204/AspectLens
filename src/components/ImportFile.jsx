import { useState } from 'react';
import * as XLSX from 'xlsx';
import { analyzeSingleText } from '../services/api'; 
import { UploadCloud, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';

// =======================================================================
// LỚP BẢO VỆ 1: BỘ LỌC REGEX TẠI FRONTEND
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

export default function ImportFile({ setAnalyticsData, setIsLoading }) {
  const [step, setStep] = useState(1);
  const [step, setStep] = useState(1);
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
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet);

      if (jsonRows.length > 0) {
        setFileData(jsonRows);
        setTargetColumn(Object.keys(jsonRows[0])[0]); 
        setStep(2);
      } else {
        alert("File Excel rỗng hoặc không đúng định dạng!");
        alert("File Excel rỗng hoặc không đúng định dạng!");
      }
    };
  };

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setProgress(0);

    const cleanArrayOfComments = fileData.map(row => String(row[targetColumn] || '').trim());
    const totalRows = cleanArrayOfComments.length;
    const resultsBuffer = []; 

    for (let i = 0; i < totalRows; i++) {
      const textToAnalyze = cleanArrayOfComments[i];

      if (!textToAnalyze) {
        setProgress(Math.round(((i + 1) / totalRows) * 100));
        continue;
      }

      // 🛑 CHỐT CHẶN 1: NẾU LÀ RÁC CƠ BẢN -> DÁN NHÃN VÀ BỎ QUA API
      if (isInvalidText(textToAnalyze)) {
        resultsBuffer.push({
          text: textToAnalyze, 
          sentiment: "Không hợp lệ", 
          probs: { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 },
          aspects: []
        });
        setProgress(Math.round(((i + 1) / totalRows) * 100));
        continue; 
      }

      // NẾU SẠCH, BẮT ĐẦU GỌI API
      try {
        const data = await analyzeSingleText(textToAnalyze);
        
        const currentProbs = data.emotion?.probs || { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 };
        
        // 🛑 CHỐT CHẶN 2: THUẬT TOÁN ĐO LƯỜNG NGƯỠNG TỰ TIN (THRESHOLD)
        const maxConfidence = Math.max(
          currentProbs["Tích cực"], 
          currentProbs["Trung tính"], 
          currentProbs["Tiêu cực"]
        );

        let finalSentiment = data.emotion?.label || 'Trung tính';
        
        // Nếu AI lú (Xác suất cao nhất < 45%) -> Ép thành Không hợp lệ
        if (maxConfidence > 0 && maxConfidence < 0.45) {
          finalSentiment = "Không hợp lệ";
        }

        resultsBuffer.push({
          text: data.aspect?.sentence || textToAnalyze,
          sentiment: finalSentiment,
          probs: currentProbs,
          aspects: data.aspect?.results || []
        });

      } catch (err) {
        console.error(`Lỗi tại dòng ${i + 1}:`, err);
        resultsBuffer.push({
          text: textToAnalyze,
          sentiment: "Lỗi kết nối",
          probs: { "Tích cực": 0, "Trung tính": 0, "Tiêu cực": 0 },
          aspects: []
        });
      }

      setProgress(Math.round(((i + 1) / totalRows) * 100));
    }

    setAnalyticsData(resultsBuffer);
    setIsLoading(false);
  };

  const resetImport = () => { setStep(1); setFileData([]); setTargetColumn(''); setProgress(0); };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[230px]">
      <div className="flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Phân tích tệp Excel hàng loạt</h3>
      </div>

      {step === 1 && (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl p-6 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/10 transition-all group flex-1">
          <FileSpreadsheet className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" />
          <span className="text-sm font-medium text-gray-600">Chọn file Excel chứa cột đánh giá</span>
          <span className="text-[11px] text-gray-400 mt-1">Tích hợp AI chống nhiễu dữ liệu (Gibberish Filter)</span>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {step === 2 && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          {progress === 0 ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Đã nhận diện cột <span className="font-bold text-indigo-600">"{targetColumn}"</span> với <span className="font-bold text-gray-800">{fileData.length}</span> dòng.
              </p>
              <div className="flex gap-2">
                <button onClick={resetImport} className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg">Hủy</button>
                <button onClick={handleStartAnalysis} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm shadow-sm transition-colors">
                  <Play className="w-4 h-4" /> Bắt đầu bóc tách AI
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">{progress < 100 ? 'Đang lọc rác & phân tích AI...' : 'Hoàn tất!'}</span>
                <span className="text-indigo-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
              </div>
              
              {progress === 100 && (
                <button onClick={resetImport} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                  <CheckCircle className="w-4 h-4" /> Tải file Excel khác
                  <CheckCircle className="w-4 h-4" /> Tải file Excel khác
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}