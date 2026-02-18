# Hướng Dẫn Tích Hợp Firebase Cho Leaderboard Đồng Bộ

Bạn cần làm theo các bước sau để kích hoạt tính năng bảng xếp hạng online (real-time).

## Bước 1: Tạo Dự Án Trên Firebase
1.  Truy cập [Firebase Console](https://console.firebase.google.com/).
2.  Nhấn **Add project** (hoặc **Create a project**).
3.  Đặt tên dự án (ví dụ: `english-learning-quest`).
4.  Tắt Google Analytics (không cần thiết cho tính năng này) và nhấn **Create project**.

## Bước 2: Tạo Web App và Lấy Cấu Hình
1.  Trong trang tổng quan của dự án vừa tạo, bấm vào biểu tượng **Web** (`</>`).
2.  Đặt tên ứng dụng (ví dụ: `Web Game`).
3.  Nhấn **Register app**.
4.  Bạn sẽ thấy một đoạn mã `firebaseConfig`. Hãy copy toàn bộ nội dung trong dấu ngoặc nhọn `{ ... }`.
    *Ví dụ:*
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSyD...",
      authDomain: "...",
      projectId: "...",
      storageBucket: "...",
      messagingSenderId: "...",
      appId: "..."
    };
    ```
5.  **Dán cấu hình này vào file `firebase.ts` trong dự án của bạn.** (Thay thế đoạn code placeholder cũ).

## Bước 3: Tạo Firestore Database (Quan Trọng)
Nếu không làm bước này, game sẽ báo lỗi khi cố lưu điểm.
1.  Trong menu bên trái của Firebase Console, chọn **Build** -> **Firestore Database**.
2.  Nhấn **Create database**.
3.  Chọn **Start in test mode** (Chế độ kiểm thử).
    *   *Lưu ý: Chế độ này cho phép đọc/ghi tự do trong 30 ngày. Sau này bạn có thể chỉnh lại Rules để bảo mật hơn.*
4.  Nhấn **Next**, chọn vị trí server (ví dụ: `asia-southeast1` cho nhanh) và nhấn **Enable**.

## Bước 4: Kiểm Tra
1.  Chạy lại game (`npm run dev` hoặc deploy lại).
2.  Chơi thử một ván game Learning Quest cho đến khi thắng.
3.  Quay lại tab **Firestore Database** trên Firebase Console.
4.  Bạn sẽ thấy một Collection tên là `leaderboard` tự động xuất hiện với dữ liệu điểm số của bạn.
5.  Mở game trên một trình duyệt khác (hoặc điện thoại), bạn sẽ thấy tên mình trên bảng xếp hạng ngay lập tức!

## Xử Lý Sự Cố
-   **Lỗi "Missing or insufficient permissions"**: Bạn chưa bật Firestore hoặc chưa chọn "Start in test mode". Vào tab **Rules** trong Firestore và đảm bảo nó cho phép read/write:
    ```
    allow read, write: if true;
    ```
-   **Lỗi kết nối**: Kiểm tra lại `apiKey` và `projectId` trong `firebase.ts` đã chính xác chưa.

## Bảo Trì & Reset Dữ Liệu

### 1. Sau 30 ngày thì sao?
Chế độ "Test Mode" chỉ cho phép dùng trong 30 ngày. Để dùng vĩnh viễn, bạn làm như sau:
1.  Vào thẻ **Rules** trong Firestore Database.
2.  Sửa đoạn code hiện có thành:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```
3.  Bấm **Publish**. (Lưu ý: Cách này cho phép ai cũng ghi điểm, phù hợp cho game đơn giản).

### 2. Cách Reset Dữ Liệu
Tôi đã cập nhật nút **"Reset Data"** trong bảng xếp hạng.
-   Khi bạn bấm nút này và xác nhận, **toàn bộ dữ liệu trên Server (Firebase) sẽ bị xóa sạch**.
-   Tất cả người chơi khác cũng sẽ thấy bảng xếp hạng trống trơn ngay lập tức.

