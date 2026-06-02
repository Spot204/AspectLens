import axios from "axios";

// Cấu hình địa chỉ IP/URL của Backend.
const BASE_URL = "https://caliber-hacker-driller.ngrok-free.dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================================================================
// HÀM 1: Gửi 1 câu văn bản lẻ lên cho AI phân tích (GIỮ NGUYÊN CỦA BẠN)
// =========================================================================
export const analyzeSingleText = async (textContent) => {
  try {
    const response = await apiClient.post("/emotion-predict", {
      text: textContent,
    });
    const res2 = await apiClient.post("/aspect-predict", {
      sentence: textContent,
    });
    console.log("Emotion response:", response.data);
    console.log("Aspect response:", res2.data);
    
    return {
      emotion: response.data,
      aspect: res2.data,
    };
  } catch (error) {
    console.error("Lỗi gọi API Phân tích đơn lẻ:", error);
    throw error;
  }
};

// =========================================================================
// HÀM 2: TRIỂN KHAI CÁCH 2 - Gửi mảng comment chữ sạch bóc từ Excel (JSON)
// =========================================================================
export const analyzeFileBatchJSON = async (arrayOfComments) => {
  try {
    // arrayOfComments truyền vào sẽ có dạng mảng chữ thuần túy: ["câu 1", "câu 2", "câu 3"...]
    // MẸO: Bạn hãy check với ông bạn Backend xem ông ấy đặt tên đường link (endpoint) 
    // nhận hàng loạt là gì nhé, ở đây tôi tạm để tên mẫu là "/batch-predict"
    const response = await apiClient.post("/batch-predict", {
      comments: arrayOfComments, // Đóng gói mảng chữ vào key "comments" gửi đi
    });

    console.log("Kết quả phân tích hàng loạt từ API:", response.data);
    return response.data; // Trả về danh sách mảng kết quả đã được AI dán nhãn
  } catch (error) {
    console.error("Lỗi gọi API Phân tích hàng loạt (Cách 2):", error);
    throw error;
  }
};