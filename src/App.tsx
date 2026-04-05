import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  amount: z.number().min(1000, 'Số tiền tối thiểu là 1,000đ'),
  purpose: z.string().min(2, 'Vui lòng nhập nội dung nộp'),
});

type RegistrationSchemaType = z.infer<typeof registrationSchema>;

export default function App() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<RegistrationSchemaType | null>(null);
  const [finalPaymentCode, setFinalPaymentCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateRandomCode = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      purpose: 'Học phí Quý 2/2026'
    }
  });

  const onSubmit = async (data: RegistrationSchemaType) => {
    setIsSubmitting(true);
    setError(null);
    
    const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxBVwHW2mfXhrJUNmohqrrzlu9LCoH3f37dKiztcpFUk3aERscCOTyVtrGRlMO7Awb-/exec';
    
    const paymentCode = `TKD ${generateRandomCode(6)}`;
    
    const payload = {
      ...data,
      paymentCode,
      submittedAt: new Date().toISOString()
    };

    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setIsSubmitting(false);
      setSubmittedData(data);
      setFinalPaymentCode(paymentCode);
      setIsSubmitted(true);
      reset();
    } catch (err) {
      console.error('Error submitting to Google Sheets:', err);
      setError('Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-tkd-red rounded-lg flex items-center justify-center text-white shadow-lg">
            <Trophy size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-tkd-dark">
            CLB Taekwondo <span className="text-tkd-red">Xuân Phương</span>
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-6 leading-tight">
              Nộp học phí Quý 2 năm 2026
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Vui lòng điền đầy đủ thông tin bên dưới để hoàn tất học phí. 
              Hệ thống sẽ cung cấp mã thanh toán và hướng dẫn ngay sau khi bạn gửi thông tin.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
            {isSubmitted && submittedData ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 md:p-16 text-center"
              >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Gửi Đăng Ký Thành Công!</h3>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                  Vui lòng quét mã QR bên dưới để hoàn tất thanh toán học phí.
                </p>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 inline-block">
                  <img 
                    src={`https://qr.sepay.vn/img?acc=2288686686&bank=MBBank&amount=${submittedData.amount}&des=${encodeURIComponent(finalPaymentCode)}&template=compact`}
                    alt="Mã QR Thanh Toán"
                    className="mx-auto w-64 h-64 shadow-lg rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-black text-slate-900">Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(submittedData.amount)}</p>
                    <p className="text-xs text-slate-500 font-medium">Nội dung: {finalPaymentCode}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Quay lại trang đăng ký
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-10 md:p-16 space-y-10">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-10 h-10 bg-tkd-blue text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-tkd-blue/20">1</span>
                    <h4 className="text-xl font-black text-slate-900">Thông tin cá nhân</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Họ và tên học viên</label>
                      <input 
                        {...register('fullName')}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-tkd-blue/10 focus:border-tkd-blue outline-none transition-all font-medium",
                          errors.fullName && "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        )}
                        placeholder="Ví dụ: Nguyễn Văn An"
                      />
                      {errors.fullName && <p className="text-xs text-red-500 font-bold">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Số điện thoại liên hệ</label>
                      <input 
                        {...register('phone')}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-tkd-blue/10 focus:border-tkd-blue outline-none transition-all font-medium",
                          errors.phone && "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        )}
                        placeholder="09xx xxx xxx"
                      />
                      {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Địa chỉ Email</label>
                      <input 
                        {...register('email')}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-tkd-blue/10 focus:border-tkd-blue outline-none transition-all font-medium",
                          errors.email && "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        )}
                        placeholder="an.nguyen@gmail.com"
                      />
                      {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-4 mb-8">
                    <span className="w-10 h-10 bg-tkd-blue text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-tkd-blue/20">2</span>
                    <h4 className="text-xl font-black text-slate-900">Thông tin thanh toán</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Số tiền nộp (VNĐ)</label>
                      <input 
                        type="number"
                        {...register('amount', { valueAsNumber: true })}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-tkd-blue/10 focus:border-tkd-blue outline-none transition-all font-medium",
                          errors.amount && "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        )}
                        placeholder="Ví dụ: 500000"
                      />
                      {errors.amount && <p className="text-xs text-red-500 font-bold">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nội dung nộp</label>
                      <input 
                        {...register('purpose')}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-tkd-blue/10 focus:border-tkd-blue outline-none transition-all font-medium",
                          errors.purpose && "border-red-200 bg-red-50 focus:ring-red-100 focus:border-red-400"
                        )}
                        placeholder="Ví dụ: Học phí tháng 4"
                      />
                      {errors.purpose && <p className="text-xs text-red-500 font-bold">{errors.purpose.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {error && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                      <X size={18} />
                      {error}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-5 bg-tkd-red text-white text-xl font-black rounded-2xl shadow-xl shadow-tkd-red/20 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3",
                      isSubmitting && "opacity-70 cursor-not-allowed translate-y-0"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Nộp học phí <ChevronRight size={24} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
                    Bảo mật thông tin tuyệt đối • Hệ thống tự động 100%
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm font-medium">
          <p>© 2026 CLB Taekwondo Xuân Phương. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
