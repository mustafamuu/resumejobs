# هنستخدم نسخة خفيفة من Node.js
FROM node:22-alpine

# تحديد مسار العمل جوه الكونتينر
WORKDIR /app

# نسخ ملفات الـ package الأول عشان نعمل install
COPY package.json package-lock.json* ./

# تسطيب المكتبات
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# فتح البورت بتاع Vite
EXPOSE 5173

# تشغيل السيرفر مع إضافة --host عشان يشتغل بره الكونتينر
CMD ["npm", "run", "dev", "--", "--host"]