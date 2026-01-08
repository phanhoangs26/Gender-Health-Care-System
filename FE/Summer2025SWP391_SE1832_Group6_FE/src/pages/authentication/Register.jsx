import { Formik } from "formik";
import {
  Form,
  Input,
  Button,
  DatePicker,
  message,
  Typography,
  Card,
  Divider,
  Select,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { registerSchema } from "../../constants/commonSchemas";
import moment from "moment";
import api from "../../api/axios";

const { Title } = Typography;
const { Option } = Select;

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      console.log("Register values:", values);
      const dateOfBirth = moment(values.dateOfBirth).format("DD/MM/YYYY");
      const res = await api.post(`/customer/register`, {
        ...values,
        dateOfBirth,
      });

      if (res.status === 200 || res.status === 201) {
        if (res.data?.token) {
          const { token, ...userData } = res.data;
          localStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          login({ ...userData, token });
          message.success("Đăng ký thành công!");
          navigate("/");
        } else if (res.data?.message) {
          message.success(res.data.message);
          navigate("/login");
        } else {
          message.success("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/login");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      message.error(
        err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại."
      );
      throw err; // Re-throw to let Formik know the submission failed
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <Card className="w-full max-w-md relative z-10 rounded-lg shadow-lg">
        <Link to="/">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            className="mb-4 text-green-600 hover:text-green-700"
          >
            Trở về Trang chủ
          </Button>
        </Link>

        <Title level={3} className="text-center text-green-600">
          Tạo tài khoản mới
        </Title>

        <Formik
          initialValues={{
            fullName: "",
            username: "",
            email: "",
            phone: "",
            dateOfBirth: null,
            address: "",
            gender: "",
            password: "",
            confirmPassword: "",
            role: "customer",
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            handleChange,
            setFieldTouched,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form
              onFinish={handleSubmit}
              layout="vertical"
              className="max-w-2xl mx-auto p-6"
            >
              {/* Full Name */}
              <Form.Item
                label="Họ và tên"
                name="fullName"
                validateStatus={
                  touched.fullName && errors.fullName ? "error" : ""
                }
                help={touched.fullName && errors.fullName}
              >
                <Input
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched("fullName", true)}
                  placeholder="Họ và tên đầy đủ"
                />
              </Form.Item>

              {/* Username */}
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

              {/* Email */}
              <Form.Item
                label="Email"
                name="email"
                validateStatus={touched.email && errors.email ? "error" : ""}
                help={touched.email && errors.email}
              >
                <Input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched("email", true)}
                  placeholder="example@email.com"
                />
              </Form.Item>

              {/* Phone Number */}
              <Form.Item
                label="Số điện thoại"
                name="phone"
                validateStatus={touched.phone && errors.phone ? "error" : ""}
                help={touched.phone && errors.phone}
              >
                <Input
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched("phone", true)}
                  placeholder="Số điện thoại"
                />
              </Form.Item>

              {/* Date of Birth */}
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                validateStatus={
                  touched.dateOfBirth && errors.dateOfBirth ? "error" : ""
                }
                help={touched.dateOfBirth && errors.dateOfBirth}
              >
                <DatePicker
                  name="dateOfBirth"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={values.dateOfBirth ? values.dateOfBirth : null}
                  onChange={(date) => setFieldValue("dateOfBirth", date)}
                  onBlur={() => setFieldTouched("dateOfBirth", true)}
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </Form.Item>

              {/* Address */}
              <Form.Item
                label="Địa chỉ"
                name="address"
                validateStatus={
                  touched.address && errors.address ? "error" : ""
                }
                help={touched.address && errors.address}
              >
                <Input.TextArea
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched("address", true)}
                  placeholder="Địa chỉ"
                  rows={1}
                />
              </Form.Item>

              {/* Gender */}
              <Form.Item
                label="Giới tính"
                name="gender"
                validateStatus={touched.gender && errors.gender ? "error" : ""}
                help={touched.gender && errors.gender}
              >
                <Select
                  name="gender"
                  value={values.gender}
                  onChange={(value) => setFieldValue("gender", value)}
                  onBlur={() => setFieldTouched("gender", true)}
                  placeholder="Chọn giới tính"
                >
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>

              {/* Password */}
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

              {/* Confirm Password */}
              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                validateStatus={
                  touched.confirmPassword && errors.confirmPassword
                    ? "error"
                    : ""
                }
                help={touched.confirmPassword && errors.confirmPassword}
              >
                <Input.Password
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => setFieldTouched("confirmPassword", true)}
                  placeholder="Nhập lại mật khẩu"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={() => {
                    // Trigger validation for all fields
                    Object.keys(values).forEach((field) => {
                      setFieldTouched(field, true, true);
                    });
                  }}
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <Divider>Hoặc</Divider>
              <div className="flex flex-row items-center justify-center gap-2">
                <Form.Item>
                  <Button
                    type="default"
                    className="w-full flex items-center justify-center gap-2 text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                    icon={
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                        alt="Google"
                        className="h-5 w-5"
                      />
                    }
                  >
                    Đăng nhập với Google
                  </Button>
                </Form.Item>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default Register;
