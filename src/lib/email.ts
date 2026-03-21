/**
 * Email Service Stub
 * 
 * في المستقبل، يمكن ترقية هذا الملف ليستخدم Resend لرسائل البريد الحقيقية للمدارس.
 * يتطلب: npm i resend
 * وإضافة RESEND_API_KEY في .env
 */

export async function sendEmailNotification(to: string, subject: string, messageHtml: string) {
  // للبيئات التطويرية وعند عدم وجود API Key، يتم فقط طباعة الرسالة لتأكيد الوصول
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n=== 📩 محاكاة إرسال بريد إلكتروني ===`);
    console.log(`إلى: ${to}`);
    console.log(`العنوان: ${subject}`);
    console.log(`المحتوى (HTML): ${messageHtml.slice(0, 100)}...`);
    console.log(`====================================\n`);
    return { success: true, simulated: true };
  }

  // في حال توفر المفتاح
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: "دار بسمة للنشر <orders@darbassma.com>",
      to: [to],
      subject: subject,
      html: messageHtml
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Resend Error:", error);
    return { success: false, error: error.message };
  }
}
