import React from "react";
import { Link } from "react-router-dom";

export default function Blog() {
  return (
    <section className="py-5 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Những câu hỏi về cơ thể bạn, được trả lời bởi chuyên gia
      </h2>
      <div className="flex items-center justify-center gap-2 max-w-6xl mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/blog" className="group">
            <img
              className="min-w-xs h-72 rounded-lg mb-4 object-cover transition-transform duration-300 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1695720247850-0f6efb4d4b83?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog image"
            />
            <h3 className="text-2xl font-bold text-gray-600 mb-6 group-hover:underline group-hover:text-black transition">
              Tìm hiểu cách vượt qua tuổi dậy thì một cách tự tin và hiểu rõ
              những thay đổi đang diễn ra trong cơ thể bạn.
            </h3>
          </Link>

          <Link to="/blog" className="group">
            <img
              className="min-w-xs h-72 rounded-lg mb-4 object-cover transition-transform duration-300 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog image"
            />
            <h3 className="text-2xl font-bold text-gray-600 mb-6 group-hover:underline group-hover:text-black transition">
              Khám phá các bí quyết xây dựng mối quan hệ lành mạnh dựa trên sự
              tôn trọng và thấu hiểu lẫn nhau.
            </h3>
          </Link>

          <Link to="/blog" className="group">
            <img
              className="min-w-xs h-72 rounded-lg mb-4 object-cover transition-transform duration-300 group-hover:scale-105"
              src="https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Blog image"
            />
            <h3 className="text-2xl font-bold text-gray-600 mb-6 group-hover:underline group-hover:text-black transition">
              Hiểu về tầm quan trọng của sức khỏe tinh thần và khám phá các
              chiến lược để duy trì sự khỏe mạnh về mặt cảm xúc.
            </h3>
          </Link>
        </div>
      </div>
    </section>
  );
}
