import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  WomanOutlined,
  ManOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { userProfileSchema } from "../../constants/commonSchemas";
import { AuthContext } from "../../context/AuthContext";
import { Loading, NotAuthenticated } from "../../components/common/Loading";
import api from "../../api/axios";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { TextArea } = Input;

const UserProfile = () => {
  const { user, logout, authLoading, isAuthenticated } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get(`/customer/profile/${user.id}`);
      const profileData = response.data;
      console.log("Fetched profile data:", profileData);
      // Set the profile with the date as a dayjs object
      setUserProfile({
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth, "DD/MM/YYYY") : null
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      message.error("Không thể tải thông tin hồ sơ");
    }
  }, [user.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, isAuthenticated]);

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log("Form submitted with values:", values);
    try {
      setLoading(true);

      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
        password: values.password || undefined, // Only include password if it's being updated
      };
      console.log("Payload to send:", payload);
      await api.put(`/customer/profile/update/${user.id}`, payload);

      message.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      await fetchUserProfile();
      resetForm({ values: { ...values, password: '', confirmPassword: '' } });
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancel = (resetForm) => {
    resetForm();
    setIsEditing(false);
  };

  // Show loading state while auth state is being determined
  if (authLoading) {
    return <Loading />;
  }

  // Only show not authenticated message if we're done loading and user is not authenticated
  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  if (!userProfile) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Title level={3} className="mb-0">
            Hồ sơ cá nhân
          </Title>
        </div>
        {!isEditing && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Formik
        enableReinitialize
        initialValues={{
          fullName: userProfile?.fullName || "",
          email: userProfile?.phone || "",
          phone: userProfile?.email || "",
          address: userProfile?.address || "",
          dateOfBirth: userProfile?.dateOfBirth || null,
          password: "",
          confirmPassword: ""
        }}
        validateOnMount={true}
        validationSchema={userProfileSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          resetForm,
          isSubmitting,
        }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card className="text-center mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      {values.gender === "FEMALE" ? (
                        <WomanOutlined className="text-5xl text-pink-500" />
                      ) : (
                        <ManOutlined className="text-5xl text-blue-500" />
                      )}
                    </div>
                    <Form.Item name="fullName" className="w-full text-center">
                      {isEditing ? (
                        <Input
                          placeholder="Họ và tên"
                          className="text-center font-semibold text-lg"
                        />
                      ) : (
                        <Title level={4} className="mb-1">
                          {userProfile.fullName || "Chưa cập nhật"}
                        </Title>
                      )}
                    </Form.Item>
                    <Text type="secondary" className="block mb-4">
                      Tài khoản khách hàng
                    </Text>
                    <Button
                      type="primary"
                      icon={<LogoutOutlined />}
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      danger
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </Card>

                <Card title="Thông tin cơ bản" className="mb-6">
                  <Form.Item
                    label="Email"
                    validateStatus={
                      touched.email && errors.email ? "error" : ""
                    }
                    help={touched.email && errors.email}
                  >
                    <Input
                      name="email"
                      prefix={<MailOutlined className="text-gray-500" />}
                      disabled={!isEditing}
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      onBlur={() => setFieldTouched("email", true)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    validateStatus={
                      touched.phone && errors.phone ? "error" : ""
                    }
                    help={touched.phone && errors.phone}
                  >
                    <Input
                      name="phone"
                      prefix={<PhoneOutlined className="text-gray-500" />}
                      disabled={!isEditing}
                      value={values.phone}
                      onChange={(e) => setFieldValue("phone", e.target.value)}
                      onBlur={() => setFieldTouched("phone", true)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ"
                    validateStatus={
                      touched.address && errors.address ? "error" : ""
                    }
                    help={touched.address && errors.address}
                  >
                    <Input
                      name="address"
                      prefix={<HomeOutlined className="text-gray-500" />}
                      disabled={!isEditing}
                      value={values.address}
                      onChange={(e) => setFieldValue("address", e.target.value)}
                      onBlur={() => setFieldTouched("address", true)}
                    />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} md={16}>
                <Card title="Thông tin cá nhân" className="mb-6">
                  <Form.Item
                    label="Ngày sinh"
                    name="dateOfBirth"
                    validateStatus={touched.dateOfBirth && errors.dateOfBirth ? "error" : ""}
                    help={touched.dateOfBirth && errors.dateOfBirth}
                  >
                    <div>
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        disabled={!isEditing}
                        placeholder="Chọn ngày sinh"
                        value={values.dateOfBirth}
                        onChange={(date) => {
                          console.log("Date changed to:", date);
                          setFieldValue("dateOfBirth", date);
                        }}
                        onBlur={() => setFieldTouched("dateOfBirth", true)}
                        disabledDate={(current) => current && current > dayjs().endOf("day")}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Mật khẩu mới"
                    name="password"
                    validateStatus={touched.password && errors.password ? "error" : ""}
                    help={touched.password && errors.password}
                  >
                    <Input.Password
                      disabled={!isEditing}
                      placeholder="Để trống nếu không đổi mật khẩu"
                      value={values.password}
                      onChange={(e) => setFieldValue("password", e.target.value)}
                      onBlur={() => setFieldTouched("password", true)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    validateStatus={touched.confirmPassword && errors.confirmPassword ? "error" : ""}
                    help={touched.confirmPassword && errors.confirmPassword}
                    dependencies={['password']}
                  >
                    <Input.Password
                      disabled={!isEditing}
                      placeholder="Nhập lại mật khẩu mới"
                      value={values.confirmPassword}
                      onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
                      onBlur={() => setFieldTouched("confirmPassword", true)}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            {isEditing && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-end space-x-4">
                  <Button
                    className="ml-2"
                    onClick={() => handleCancel(resetForm)}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    icon={<SaveOutlined />}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UserProfile;
