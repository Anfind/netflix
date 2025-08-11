# 🚀 Setup Nhanh Cinema Web MERN

Làm theo các bước này để chạy dự án trong 5 phút:

## 📋 Bước 1: Chuẩn bị
```bash
# Đảm bảo bạn có Node.js >= 18
node --version

# Đảm bảo MongoDB đang chạy (local) hoặc có MongoDB Atlas connection
```

## 🔧 Bước 2: Install & Setup
```bash
# Vào thư mục backend
cd d:\An\CinemaWebMern\midtest

# Install dependencies
npm install

# Kiểm tra file .env đã có MONGO_URI chưa
# File .env hiện tại: MONGO_URI=mongodb://localhost:27017/mindx
```

## 🌱 Bước 3: Seed Database
```bash
# Tạo dữ liệu mẫu (users, movies, favorites, history)
npm run seed
```

Kết quả:
- ✅ 1 admin: `admin@gmail.com / admin123`
- ✅ 3 users: `user@gmail.com / user123`
- ✅ 10+ phim với YouTube trailers
- ✅ Sample favorites & watch history

## 🚀 Bước 4: Chạy Server
```bash
# Development mode (auto-reload)
npm run dev

# Server chạy tại: http://localhost:8080
```

## 🧪 Bước 5: Test API
Mở terminal mới:
```bash
cd d:\An\CinemaWebMern\midtest
npm run test-api
```

Hoặc test manual:
```bash
# Health check
curl http://localhost:8080/health

# Danh sách phim
curl http://localhost:8080/movies

# Đăng nhập user
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"user123"}'

# Đăng nhập admin
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

## 📱 Frontend (Nếu có)
```bash
# Vào thư mục frontend
cd d:\An\CinemaWebMern\NETFLIX\netflix

# Install dependencies
npm install

# Chạy frontend
npm run dev
# Frontend chạy tại: http://localhost:5173
```

## ✅ Kiểm tra thành công

1. **Backend**: `http://localhost:8080/health` trả về status OK
2. **Database**: `npm run seed` chạy không lỗi
3. **API Test**: `npm run test-api` pass hết tests
4. **Login**: Đăng nhập được với accounts admin/user

## 🎯 Next Steps

Sau khi setup xong:

1. **Explore API**: Dùng Postman hoặc curl test các endpoints
2. **Admin Features**: Login admin để test CRUD movies
3. **User Features**: Login user để test favorites/history
4. **Frontend**: Connect React frontend với backend API

## 🐛 Troubleshooting

### Lỗi MongoDB Connection
```bash
# Nếu dùng local MongoDB
net start MongoDB

# Nếu dùng Atlas, check connection string trong .env
```

### Lỗi Port 8080 đã được sử dụng
```bash
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080

# Kill process (thay PID)
taskkill /PID <PID> /F
```

### Lỗi npm install
```bash
# Clear cache và reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

**Chúc bạn setup thành công! 🎉**
