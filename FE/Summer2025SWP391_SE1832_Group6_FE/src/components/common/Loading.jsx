import React from "react";
import { Spin } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4">Đang tải dữ liệu...</p>
      </div>
    </div>
  );
}

export function NotAuthenticated() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <ExclamationCircleOutlined className="text-4xl text-yellow-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Yêu cầu đăng nhập</h2>
      <p className="text-lg mb-6 text-center">
        Bạn cần đăng nhập để truy cập trang này.
      </p>
      <div className="space-y-4">
        <Button
          type="primary"
          onClick={() =>
            navigate("/login", { state: { from: window.location.pathname } })
          }
          className="w-full"
        >
          Đi đến trang đăng nhập
        </Button>
        <Button type="default" onClick={() => navigate("/")} className="w-full">
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
