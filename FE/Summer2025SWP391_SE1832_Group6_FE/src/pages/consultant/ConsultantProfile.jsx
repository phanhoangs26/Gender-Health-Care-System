import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Avatar,
  Row,
  Col,
  Typography,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  EditOutlined,
  MailOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Formik } from "formik";
import { consultantProfileSchema } from "../../constants/commonSchemas";
import { useNavigate } from "react-router-dom";

// Initialize Cloudinary Upload Widget
const CLOUD_NAME = "dgx02b7o0";
const UPLOAD_PRESET = "ml_default";

// Add Cloudinary script to the document
const loadCloudinaryScript = () => {
  return new Promise((resolve) => {
    if (window.cloudinary) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

// Load Cloudinary script when the component mounts
loadCloudinaryScript();

const { Title, Text } = Typography;

const ConsultantProfile = () => {
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(`/consultant/profile/${user.id}`);
      setProfile(response.data);
      // Set preview image if avatarUrl exists
      if (response.data.avatarUrl) {
        setPreviewImage(response.data.avatarUrl);
      }
      form.setFieldsValue({
        fullName: response.data.fullName,
        email: response.data.email,
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
    } catch (error) {
      console.error("Error fetching consultant profile:", error);
      error.response.status === 404
        ? message.error("Không có thông tin hồ sơ")
        : message.error("Không thể tải thông tin hồ sơ");
    }
  }, [form, user.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // Handle file upload with Cloudinary
  const handleUpload = () => {
    window.cloudinary
      .createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          sources: ["local", "camera"],
          showAdvancedOptions: false,
          cropping: true,
          multiple: false,
          defaultSource: "local",
          styles: {
            palette: {
              window: "#FFFFFF",
              sourceBg: "#f4f4f5",
              windowBorder: "#90a0b3",
              tabIcon: "#0078FF",
              inactiveTabIcon: "#555a5f",
              menuIcons: "#555a5f",
              link: "#0078FF",
              action: "#FF620C",
              inProgress: "#0078FF",
              complete: "#20b832",
              error: "#d42638",
              textDark: "#000000",
              textLight: "#fcfffd",
            },
            fonts: {
              default: null,
              "sans-serif": {
                url: null,
                active: true,
              },
            },
          },
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            console.log("imageUrl", imageUrl);
            form.setFieldsValue({ avatarUrl: imageUrl });
            setPreviewImage(imageUrl);
            message.success("Tải lên ảnh đại diện thành công!");
          } else if (error) {
            console.error("Upload error:", error);
            message.error("Tải lên ảnh thất bại");
          }
        }
      )
      .open();
  };

  // Update profile handler
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const updatedValues = {
        ...values,
        avatarUrl: previewImage || profile?.avatarUrl,
      };
      console.log("updatedValues", updatedValues);
      await api.put(`/consultant/profile/update/${user.id}`, updatedValues);
      // Update local profile data
      setProfile((prev) => ({ ...prev, ...updatedValues }));
      message.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin";
      message.error(errorMessage);
      
      // Handle specific field errors if available
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          setFieldError(err.field, err.message);
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={3} className="mb-6">
        Hồ sơ tư vấn viên
      </Title>

      <Row gutter={24}>
        <Col xs={24} md={8} className="mb-6">
          <Card className="text-center">
            <div className="mb-4 relative group">
              <Avatar
                size={120}
                src={previewImage || profile?.avatarUrl}
                icon={
                  !previewImage && !profile?.avatarUrl ? <UserOutlined /> : null
                }
                className="bg-blue-100 text-green-600 text-4xl cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleUpload}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={handleUpload}
                  className="shadow-lg"
                />
              </div>
            </div>
            <Title level={4} className="mb-1">
              {profile?.fullName || "Chưa cập nhật"}
            </Title>
            <Text type="secondary">Tư vấn viên</Text>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông tin cá nhân">
            <Formik
              enableReinitialize
              initialValues={{
                fullName: profile?.fullName || "",
                email: profile?.email || "",
                phone: profile?.phone || "",
                address: profile?.address || "",
              }}
              validationSchema={consultantProfileSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        validateStatus={touched.fullName && errors.fullName ? 'error' : ''}
                        help={touched.fullName && errors.fullName}
                      >
                        <Input
                          name="fullName"
                          prefix={<UserOutlined />}
                          placeholder="Nhập họ và tên"
                          value={values.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        validateStatus={touched.email && errors.email ? 'error' : ''}
                        help={touched.email && errors.email}
                      >
                        <Input
                          name="email"
                          prefix={<MailOutlined />}
                          placeholder="Nhập email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        validateStatus={touched.phone && errors.phone ? 'error' : ''}
                        help={touched.phone && errors.phone}
                      >
                        <Input
                          name="phone"
                          prefix={<PhoneOutlined />}
                          placeholder="Nhập số điện thoại"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Địa chỉ"
                    validateStatus={touched.address && errors.address ? 'error' : ''}
                    help={touched.address && errors.address}
                  >
                    <Input.TextArea
                      name="address"
                      rows={2}
                      placeholder="Nhập địa chỉ chi tiết"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSubmitting}
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      Cập nhật thông tin
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Formik>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ConsultantProfile;
