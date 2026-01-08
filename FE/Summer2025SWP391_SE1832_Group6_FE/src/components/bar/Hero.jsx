import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center bg-blue-50 bg-[url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center pb-4 text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Chăm sóc Sức khỏe Giới tính Toàn diện
      </h1>
      <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl">
        Đưa ra dịch vụ chăm sóc sức khỏe giới tính toàn diện, bao gồm tư vấn, hỗ
        trợ và điều trị. Chúng tôi cam kết tạo ra môi trường an toàn, thân thiện
        và không phán xét.
      </p>
      <div className="flex space-x-30">
        <Link
          to="/consultant"
          className="px-5 py-5 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
        >
          Bắt đầu ngay
        </Link>
      </div>
    </div>
  );
}

export default Hero;
