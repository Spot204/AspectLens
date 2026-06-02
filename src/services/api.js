import axios from "axios";

// Cấu hình địa chỉ IP/URL của Backend.
// Sau này ông bạn Backend chạy cổng nào (ví dụ: localhost:5000) thì bạn đổi số ở đây.
const BASE_URL = "https://caliber-hacker-driller.ngrok-free.dev";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm gửi 1 câu văn bản lẻ lên cho AI phân tích
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
    /* Backend trả về dự kiến dạng:
    {
      emotion: {
        label: "Tiêu cực",
        probs: {
          "Tiêu cực": 0.7051,
          "Trung tính": 0.2303,
          "Tích cực": 0.0646
        }
      },
      aspect: {
        results: [
          {aspect: 'chet_lieu', sentiment: 'negative', aspect_score: 0.6486, sentiment_confidence: 0.6959},
          {aspect: 'chat_luong', sentiment: 'neutral', aspect_score: 0.8158, sentiment_confidence: 0.5101}
        ],
        sentiment: string,
        total_aspects: number
      }
    }
    */
  } catch (error) {
    console.error("Lỗi gọi API Phân tích:", error);
    throw error;
  }
};
