import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
            <p className="text-sm text-gray-600">
              Chúng tôi cam kết cung cấp tài nguyên và hỗ trợ về sức khỏe giới
              tính. Hãy cùng chúng tôi tạo nên một thế giới khỏe mạnh và bao
              dung hơn.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-sm text-gray-600 hover:text-green-600 transition"
                >
                  Giới thiệu
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-green-600 transition"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-green-600 transition"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-green-600 transition"
                >
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition"
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition"
              >
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition"
              >
                <i className="fab fa-instagram"></i> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 border-t border-gray-300 pt-4 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Example Company. Đã đăng ký bản
            quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
