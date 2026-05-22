import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart as BarIcon, PieChart as PieIcon } from 'lucide-react';

export default function DashboardChart({ data }) {
  // Dùng useMemo để tính toán lại số liệu thống kê mỗi khi mảng 'data' thay đổi
  const chartData = useMemo(() => {
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    data.forEach((item) => {
      if (item.sentiment === 'Tích cực') positive++;
      else if (item.sentiment === 'Tiêu cực') negative++;
      else neutral++;
    });

    return [
      { name: 'Tích cực', value: positive, color: '#10B981' }, // Màu xanh lá Tailwind
      { name: 'Trung tính', value: neutral, color: '#9CA3AF' }, // Màu xám Tailwind
      { name: 'Tiêu cực', value: negative, color: '#EF4444' }, // Màu đỏ Tailwind
    ];
  }, [data]);

  const totalReviews = data.length;

  // Nếu chưa có dữ liệu nào được phân tích, hiện trạng thái trống (Empty State) đầy tinh tế
  if (totalReviews === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-12">
        <PieIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Chưa có dữ liệu thống kê</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
          Vui lòng nhập văn bản hoặc tải file dữ liệu lên để hệ thống AI tính toán tỷ lệ sắc thái cảm xúc.
          </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
        <BarIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Tổng quan phân phối sắc thái</h3>
        <span className="ml-auto text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
          Tổng số lượng: {totalReviews} mẫu
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Cột 1 & 2: Vẽ biểu đồ tròn */}
        <div className="md:col-span-2 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.filter(d => d.value > 0)} // Chỉ vẽ các vùng có giá trị > 0
                cx="50%"
                cy="50%"
                innerRadius={60} // Tạo khoảng trống ở giữa biến nó thành biểu đồ Donut
                outerRadius={80}
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

        {/* Cột 3: Hiển thị dạng số lượng chỉ số (Dashboard Widget) */}
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = totalReviews > 0 ? Math.round((item.value / totalReviews) * 100) : 0;
            return (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
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