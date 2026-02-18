# HƯỚNG DẪN KIỂM TRA LỖI FIREBASE (TỪ A-Z)

Bạn hãy làm theo đúng 3 bước này để đảm bảo game chạy 100%.

## BƯỚC 1: KIỂM TRA CODE (Đã OK)
Tôi đã kiểm tra giúp bạn, phần này **ĐÃ XONG**.
-   File `firebase.ts` đã chứa đúng mã Key bạn gửi.
-   Code game đã có chức năng gửi điểm.
-   **Bạn KHÔNG cần làm gì ở bước này.**

---

## BƯỚC 2: CẤU HÌNH DATABASE (Quan trọng nhất)
Đây là bước hay bị lỗi nhất. Bạn hãy vào web [Firebase Console](https://console.firebase.google.com/) và làm y hệt thế này:

1.  Bấm vào dự án **LEARNINGQUEST**.
2.  Nhìn menu bên tay trái -> Tìm mục **Build** (hoặc biểu tượng cái búa) -> Chọn **Firestore Database**.
3.  Bấm vào tab **Rules** (ở phía trên, cạnh tab Data).
4.  **XÓA SẠCH** mọi chữ trong khung soạn thảo.
5.  **COPY VÀ DÁN** đoạn code chuẩn này vào:
    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```
6.  Bấm nút **Publish** (Xuất bản) ở góc trên bên phải. Nếu nó hiện màu xanh lá cây hoặc hết báo đỏ là OK.

---

## BƯỚC 3: TẠO DỮ LIỆU ĐẦU TIÊN
Sau khi làm xong Bước 2, database vẫn chưa có gì (trống trơn). Bạn phải chơi thử để "kích hoạt" nó.

1.  Mở game lên (trên máy tính hoặc điện thoại đều được).
2.  Chơi hết một ván **Learning Quest** (trả lời bừa cũng được, miễn sao đến màn hình Kết quả).
3.  Ở màn hình Chiến thắng/Game Over -> Bấm nút xem **Leaderboard**.
4.  Lúc này, tên bạn sẽ hiện lên bảng xếp hạng -> **THÀNH CÔNG!**

### Cách kiểm tra chéo (Option):
-   Quay lại trang Firebase Console -> Bấm tab **Data**.
-   Bạn sẽ thấy xuất hiện dòng chữ `leaderboard` ở cột trái và dữ liệu điểm số ở cột phải.
