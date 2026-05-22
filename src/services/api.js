import axios from 'axios';

// Cấu hình địa chỉ IP/URL của Backend. 
// Sau này ông bạn Backend chạy cổng nào (ví dụ: localhost:5000) thì bạn đổi số ở đây.
const BASE_URL = 'http://localhost:5000/api'; 

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Quá 10 giây không phản hồi thì ngắt kết nối
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm gửi 1 câu văn bản lẻ lên cho AI phân tích
export const analyzeSingleText = async (textContent) => {
  try {
    const response = await apiClient.post('/analyze-text', { text: textContent });
    return response.data; 
    /* Backend trả về dự kiến dạng:
      {
        "text": "Sản phẩm rất tốt",
        "sentiment": "Tích cực",
        "confidence": 0.95,
        "keywords": ["rất tốt"]
      }
    */
  } catch (error) {
    console.error("Lỗi gọi API Phân tích:", error);
    throw error;
  }
};