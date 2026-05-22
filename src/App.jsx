import { useState } from "react";
import SingleInput from "./components/SingleInput";
import ImportFile from "./components/ImportFile";
import DashboardChart from "./components/DashboardChart";
import ExportFile from "./components/ExportFile";
import ResultCard from "./components/ResultCard";

export default function App() {
  // Quản lý mảng dữ liệu tổng trích xuất từ việc import file
  const [analyticsData, setAnalyticsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      
      {/* THANH TIÊU ĐỀ (HEADER) */}
      <header className="mb-8 flex items-center gap-3 border-b border-gray-200/80 pb-5">
        <div className="bg-indigo-600 text-white p-2.5 rounded-xl font-black text-xl tracking-wider shadow-md shadow-indigo-100">
          AL
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ASPECTLENS</h1>
          <p className="text-xs text-gray-500 font-medium">Hệ thống Phân tích Sắc thái Cảm xúc Đánh giá v1.0</p>
        </div>
      </header>

      {/* KHU VỰC ĐẦU VÀO: CHIA ĐÔI MÀN HÌNH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Khối bên trái: Thử nghiệm nhập lẻ tại chỗ (State độc lập) */}
        <SingleInput />
        
        {/* Khối bên phải: Tải file dữ liệu lớn & Chạy tiến trình */}
        <ImportFile setAnalyticsData={setAnalyticsData} setIsLoading={setIsLoading} />
      </div>

      {/* KHU VỰC BIỂU ĐỒ VĨ MÔ */}
      <div className="mb-8">
        <DashboardChart data={analyticsData} />
      </div>

      {/* KHU VỰC DANH SÁCH CHI TIẾT TỪ FILE IMPORT */}
      {analyticsData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Dữ liệu phân tích chi tiết từ File</h2>
              <p className="text-xs text-gray-400 mt-0.5">Danh sách kết quả do AI trích xuất và chấm điểm</p>
            </div>
            {/* Nút xuất file kết quả sạch */}
            <ExportFile data={analyticsData} />
          </div>
          
          {/* Danh sách các thẻ kết quả xếp chồng, giới hạn chiều cao khung cuộn nếu quá nhiều data */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {analyticsData.map((item, index) => (
              <ResultCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}