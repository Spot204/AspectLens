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

