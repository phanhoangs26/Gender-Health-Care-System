import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Card } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { loginSchema } from "../../constants/commonSchemas";
import { Formik } from "formik";
import api from "../../api/axios";
import { message } from "antd";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      const { username, password } = values;
      const endpoints = [
        { role: "CUSTOMER", path: "/customer/login" },
        { role: "STAFF", path: "/staff/login" },
        { role: "MANAGER", path: "/manager/login" },
        { role: "CONSULTANT", path: "/consultant/login" },
        { role: "ADMIN", path: "/admin/login" },
      ];

      let response = null;
      let userRole = null;

      // Try each endpoint until one succeeds
      for (const { role, path } of endpoints) {
        try {
          const res = await api.post(path, { username, password });
          console.log(res);
          if (res.data || res.data?.token) {
            response = res.data || res.data?.token;
            userRole = role;
            break; // Exit loop on first successful login
          }
        } catch (error) {
          console.log(`Login attempt failed for ${role}:`, error.message);
          // Continue to next endpoint
        }
      }

      if (response) {
        // The token is the entire response.data string
        const token = response?.["JWT token"] || response?.token || response;
        login(token, { ...user, role: userRole });
        // Redirect based on role
        const paths = {
          CUSTOMER: "/",
          STAFF: "/staff/dashboard",
          MANAGER: "/dashboard",
          CONSULTANT: "/consultant/dashboard",
          ADMIN: "/admin/dashboard",
        };
        navigate(paths[userRole] || "/");
        message.success(`Chào mừng trở lại, ${user?.fullname || username}!`);
      } else {
        setFieldError("password", "Tên đăng nhập hoặc mật khẩu không chính xác");
      }
    } catch (error) {
      console.error("Login error:", error);
      setFieldError("password", "Tên đăng nhập hoặc mật khẩu không chính xác");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <Card className="w-full max-w-md relative z-10 rounded-lg shadow-lg">
        <Formik
          initialValues={{
            username: "",
            password: "",
            role: "CUSTOMER",
          }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            setFieldTouched,
          }) => (
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              className="max-w-2xl mx-auto p-6"
            >
              <Form.Item>
                <Link to="/">
                  <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    className="text-green-600 hover:text-green-700"
                  >
                    Trở về Trang chủ
                  </Button>
                </Link>
              </Form.Item>

              <Title level={3} className="text-center text-green-600">
                Đăng nhập vào tài khoản
              </Title>

              <div className="mt-6">
                <Form.Item
                  label="Tên đăng nhập"
                  name="username"
                  validateStatus={
                    touched.username && errors.username ? "error" : ""
                  }
                  help={touched.username && errors.username}
                >
                  <Input
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={() => setFieldTouched("username", true)}
                    placeholder="Tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  validateStatus={
                    touched.password && errors.password ? "error" : ""
                  }
                  help={touched.password && errors.password}
                >
                  <Input.Password
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={() => setFieldTouched("password", true)}
                    placeholder="Mật khẩu"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full bg-green-600 hover:bg-green-700 border-none"
                    size="large"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    onClick={() => {
                      // Trigger validation for all fields
                      Object.keys(values).forEach((field) => {
                        setFieldTouched(field, true, true);
                      });
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>

                <div className="text-center flex justify-between flex-col">
                  <Link
                    to="/register"
                    className="text-green-600 hover:text-green-700"
                  >
                    <span className="text-gray-600">Chưa có tài khoản? </span>
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Login;
