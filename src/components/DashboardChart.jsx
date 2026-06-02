import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart as BarIcon, PieChart as PieIcon, ShieldAlert } from 'lucide-react';

export default function DashboardChart({ data }) {
  const chartData = useMemo(() => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let invalid = 0; // Thêm biến đếm số lượng rác

    data.forEach((item) => {
      if (item.sentiment === 'Tích cực') positive++;
      else if (item.sentiment === 'Tiêu cực') negative++;
      else if (item.sentiment === 'Không hợp lệ' || item.sentiment === 'Lỗi kết nối') invalid++;
      else neutral++; // Chỉ còn lại Trung tính thực sự
    });

    return [
      { name: 'Tích cực', value: positive, color: '#10B981' }, // Xanh lá
      { name: 'Trung tính', value: neutral, color: '#9CA3AF' }, // Xám nhạt
      { name: 'Tiêu cực', value: negative, color: '#EF4444' }, // Đỏ
      { name: 'Bị loại bỏ (Rác/Lỗi)', value: invalid, color: '#78716C' }, // Xám Đá (Stone)
    ];
  }, [data]);

  const totalReviews = data.length;
  const invalidCount = chartData[3].value;

  if (totalReviews === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-12">
        <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Chưa có dữ liệu thống kê</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
          Vui lòng nhập văn bản hoặc tải file dữ liệu lên để hệ thống AI tính toán.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
        <BarIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Tổng quan phân phối sắc thái</h3>
        
        <div className="ml-auto flex gap-2">
          {invalidCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md border border-stone-200">
              <ShieldAlert className="w-3 h-3" />
              Đã chặn {invalidCount} rác
            </span>
          )}
          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
            Tổng: {totalReviews} mẫu
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.filter(d => d.value > 0)}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} đánh giá`, 'Số lượng']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = totalReviews > 0 ? Math.round((item.value / totalReviews) * 100) : 0;
            return (
              <div key={index} className={`p-3 rounded-lg border flex items-center justify-between ${item.value === 0 ? 'opacity-40 grayscale bg-gray-50/50 border-gray-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-sm font-medium ${item.name === 'Bị loại bỏ (Rác/Lỗi)' ? 'text-stone-600 line-through' : 'text-gray-600'}`}>{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">{item.value}</span>
                  <span className="text-xs text-gray-400 ml-1.5">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}