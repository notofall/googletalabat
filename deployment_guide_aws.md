
# دليل رفع نظام إتقان v2.0 على AWS

للرفع الاحترافي، اتبع الخطوات التالية:

### 1. استضافة الواجهة الأمامية (Frontend)
*   استخدم **AWS Amplify**: وهي الطريقة الأسهل. اربط مستودع الكود (GitHub) بـ Amplify وسيقوم بعمل Build ونشر تلقائي.
*   تأكد من إضافة `API_KEY` الخاص بـ Gemini في إعدادات (Environment Variables) في Amplify.

### 2. إعداد قاعدة البيانات (Backend)
*   قم بإنشاء قاعدة بيانات **Amazon RDS** من نوع PostgreSQL.
*   استخدم ملف `database.sql` الموجود في المشروع لإنشاء الهيكل.

### 3. تحويل الـ Mock API
*   حالياً النظام يستخدم `localStorage`. للإنتاج، يجب إنشاء مشروع Node.js/Express بسيط يقوم بتنفيذ عمليات CRUD على قاعدة البيانات RDS.
*   قم بتحديث `services/databaseService.ts` ليوجه الطلبات إلى رابط الـ API الجديد بدلاً من الـ Mock Server.

### 4. الأمان
*   استخدم **AWS Secrets Manager** لتخزين مفاتيح الـ API.
*   فعل شهادة SSL عبر **AWS Certificate Manager**.
