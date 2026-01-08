import React, { useState, useEffect, useCallback, useContext } from "react";
import { Formik } from "formik";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Descriptions,
  Tabs,
  Upload,
  DatePicker,
  Table,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SolutionOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";
import { HUMAN_STATUS } from "../../constants/statusOptions";
import {
  StatusTag,
  ActionButtons,
} from "../../components/common/DataTable";
import {
  certificateSchema,
  staffSchema,
  statusSchema,
} from "../../constants/commonSchemas";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import dayjs from "dayjs";

const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

const ImageUploader = ({ value, onChange, onUploadingChange }) => {
  const [imageUrl, setImageUrl] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const handleCancelPreview = () => {
    setPreviewVisible(false);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Bạn chỉ có thể tải lên file ảnh!");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      onUploadingChange?.(true);
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      formData.append("cloud_name", "dgx02b7o0");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgx02b7o0/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const url = data.secure_url;
        setImageUrl(url);
        onChange?.(url);
        onSuccess("Tải lên thành công");
        message.success("Tải lên ảnh chứng chỉ thành công!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError?.(error);
      message.error("Tải lên ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        customRequest={handleUpload}
        disabled={uploading}
        accept="image/*"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Nhấn hoặc kéo thả ảnh vào đây để tải lên
        </p>
        <p className="ant-upload-hint">
          Hỗ trợ tải lên 1 ảnh duy nhất với kích thước tối đa 5MB
        </p>
      </Dragger>

      {imageUrl && (
        <div className="mt-4">
          <div className="flex items-center">
            <img
              src={imageUrl}
              alt="Certificate preview"
              className="w-20 h-20 object-cover rounded border mr-2 cursor-pointer"
              onClick={() => handlePreview(imageUrl)}
            />
            <div>
              <p className="text-sm text-gray-500">Ảnh đã tải lên</p>
              <Button type="link" onClick={() => handlePreview(imageUrl)}>
                Xem ảnh
              </Button>
              <Button
                type="link"
                danger
                onClick={() => {
                  setImageUrl("");
                  onChange?.("");
                }}
              >
                Xóa ảnh
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={previewVisible}
        title="Xem trước ảnh"
        footer={null}
        onCancel={handleCancelPreview}
      >
        <img alt="Preview" className="w-full" src={previewImage} />
      </Modal>
    </div>
  );
};

const RegistrationForm = ({ formik, activeTab, setActiveTab }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = formik;

  return (
    <Form layout="vertical" onFinish={handleSubmit}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        onTabClick={(key) => {
          // Validate current tab before switching
          if (key === "2") {
            const requiredFields = [
              "username",
              "fullName",
              "password",
              "phone",
              "email",
              "address",
            ];
            const hasErrors = requiredFields.some(
              (field) => !values[field] || (errors[field] && touched[field])
            );

            if (hasErrors) {
              message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
              return;
            }
          }
          setActiveTab(key);
        }}
      >
        <TabPane tab="Thông tin tài khoản" key="1">
          <Form.Item
            label="Tên tài khoản"
            validateStatus={
              errors.username && touched.username ? "error" : ""
            }
            help={touched.username && errors.username}
            required
          >
            <Input
              name="username"
              placeholder="Nhập tên tài khoản"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            validateStatus={
              errors.password && touched.password ? "error" : ""
            }
            help={touched.password && errors.password}
            required
          >
            <Input.Password
              name="password"
              placeholder="Nhập mật khẩu"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Họ và tên"
            validateStatus={
              errors.fullName && touched.fullName ? "error" : ""
            }
            help={touched.fullName && errors.fullName}
            required
          >
            <Input
              name="fullName"
              placeholder="Nhập họ và tên"
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={errors.email && touched.email ? "error" : ""}
            help={touched.email && errors.email}
            required
          >
            <Input
              name="email"
              type="email"
              placeholder="Nhập email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            validateStatus={errors.phone && touched.phone ? "error" : ""}
            help={touched.phone && errors.phone}
            required
          >
            <Input
              name="phone"
              placeholder="Nhập số điện thoại"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            validateStatus={
              errors.address && touched.address ? "error" : ""
            }
            help={touched.address && errors.address}
            required
          >
            <Input.TextArea
              name="address"
              placeholder="Nhập địa chỉ"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
            />
          </Form.Item>
        </TabPane>

        <TabPane tab="Chứng chỉ" key="2">
          <Form.Item
            label="Tên chứng chỉ"
            validateStatus={
              errors.certificateName && touched.certificateName
                ? "error"
                : ""
            }
            help={touched.certificateName && errors.certificateName}
            required
          >
            <Input
              name="certificateName"
              placeholder="Nhập tên chứng chỉ"
              value={values.certificateName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Nơi cấp"
            validateStatus={
              errors.issuedBy && touched.issuedBy ? "error" : ""
            }
            help={touched.issuedBy && errors.issuedBy}
            required
          >
            <Input
              name="issuedBy"
              placeholder="Nhập nơi cấp"
              value={values.issuedBy || ""}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Ngày cấp"
            validateStatus={
              errors.issueDate && touched.issueDate ? "error" : ""
            }
            help={touched.issueDate && errors.issueDate}
            required
          >
            <DatePicker
              name="issueDate"
              format="DD/MM/YYYY"
              className="w-full"
              value={values.issueDate}
              onChange={(date) => setFieldValue("issueDate", date)}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Ngày hết hạn"
            validateStatus={
              errors.expiryDate && touched.expiryDate ? "error" : ""
            }
            help={touched.expiryDate && errors.expiryDate}
          >
            <DatePicker
              name="expiryDate"
              format="DD/MM/YYYY"
              className="w-full"
              value={values.expiryDate}
              onChange={(date) => setFieldValue("expiryDate", date)}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            validateStatus={
              errors.description && touched.description ? "error" : ""
            }
            help={touched.description && errors.description}
          >
            <Input.TextArea
              name="description"
              rows={3}
              placeholder="Nhập mô tả"
              value={values.description || ""}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Form.Item>

          <Form.Item
            label="Ảnh chứng chỉ"
            validateStatus={
              errors.certificateImage && touched.certificateImage
                ? "error"
                : ""
            }
            help={touched.certificateImage && errors.certificateImage}
          >
            <ImageUploader
              value={values.certificateImage}
              onChange={(url) => setFieldValue("certificateImage", url)}
            />
          </Form.Item>
        </TabPane>
      </Tabs>
    </Form>
  );
};

const UpdateForm = ({ formik }) => {
  const [currentStatus, setCurrentStatus] = useState(formik.values.status || 'ACTIVE');

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Form.Item label="Trạng thái">
        <Select
          value={currentStatus}
          onChange={(value) => {
            console.log('Selected status:', value);
            setCurrentStatus(value);
            formik.setFieldValue('status', value);
          }}
          className="w-full"
          placeholder="Chọn trạng thái"
        >
          {HUMAN_STATUS
            .filter(option => option.value !== 'DELETED')
            .map(option => (
              <Option key={option.value} value={option.value}>
                <Tag color={option.color}>{option.label}</Tag>
              </Option>
            ))}
        </Select>
      </Form.Item>

      <div className="flex justify-end mt-4">
        <Button onClick={formik.resetForm} className="mr-2">
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={formik.isSubmitting}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Cập nhật
        </Button>
      </div>
    </Form>
  );
};

const { Search } = Input;

const ManageConsultant = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  const [updateFormValues, setUpdateFormValues] = useState({
    status: "ACTIVE",
  });

  // GET CONSULTANTS
  const fetchConsultants = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        sort: "accountId",
        order: "asc",
      };
      const response = await api.get(`manager/consultants/`, { params });
      const consultants = response.data.consultants || [];
      setStaffs(consultants);
      setFilteredStaffs(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      error.response.status === 404
        ? message.error("Không tìm thấy tư vấn viên")
        : message.error("Không thể tải danh sách tư vấn viên");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter consultants based on search text
  const filterConsultants = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredStaffs(staffs);
      return;
    }
    
    const filtered = staffs.filter(consultant => 
      Object.values(consultant).some(value => 
        value && 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchText.toLowerCase())
      ) ||
      (consultant.fullName && 
       consultant.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
      (consultant.email && 
       consultant.email.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    setFilteredStaffs(filtered);
  }, [searchText, staffs]);

  // Update filtered consultants when search text or consultants change
  useEffect(() => {
    filterConsultants();
  }, [filterConsultants]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConsultants();
    }
  }, [fetchConsultants, isAuthenticated]);

  // Update filtered staffs when staffs data changes
  useEffect(() => {
    setFilteredStaffs(staffs);
  }, [staffs]);
  
  const handleSearch = (value) => {
    setSearchText(value);
  };

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // MODAL
  const showDetailModal = (consultant) => {
    api
      .get(`/manager/consultants/${consultant.accountId}`)
      .then((response) => {
        setSelectedConsultant(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching consultant details:", error);
        message.error("Failed to load consultant details");
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedConsultant(null);
  };

  // EVENT HANDLER
  const showEditModal = (user) => {
    setEditingUser(user);
    setIsRegistering(false);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setIsRegistering(false);
    setUpdateFormValues({ status: "ACTIVE" });
  };

  // FORM API
  const handleAddNew = () => {
    setIsModalVisible(true);
    setIsRegistering(true);
    setEditingUser(null);
    setActiveTab("1");
  };

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      setLoading(true);

      const newStaff = {
        username: values.username,
        fullName: values.fullName,
        password: values.password,
        phone: values.phone,
        email: values.email,
        address: values.address,
        status: values.status,
        avatarUrl: "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
        certificates: [
          {
            certificateName: values.certificateName,
            issuedBy: values.issuedBy,
            issueDate: values.issueDate ? dayjs(values.issueDate).format("DD/MM/YYYY") : null,
            expiryDate: values.expiryDate
              ? dayjs(values.expiryDate).format("DD/MM/YYYY")
              : null,
            description: values.description,
            imageUrl: values.certificateImage,
          },
        ],
      };

      console.log("Submitting:", JSON.stringify(newStaff, null, 2));

      await api.post(`/manager/consultants/register`, newStaff);
      message.success("Tạo tư vấn viên mới thành công");
      setIsModalVisible(false);
      fetchConsultants();
      // Reset form values
      RegistrationForm.resetForm();
    } catch (error) {
      console.error("Error creating consultant:", error);
      message.error(
        error.response?.data?.message || "Tạo tư vấn viên thất bại"
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values, { setSubmitting }) => {
    try {
      const res = await api.post(
        `/manager/consultants/update_status/${editingUser.accountId}?status=${values.status}`
      );
      console.log(res)
      message.success("Cập nhật trạng thái thành công");
      setIsModalVisible(false);
      setEditingUser(null);
      setUpdateFormValues({ status: "ACTIVE" });
      await fetchConsultants();
    } catch (error) {
      console.error("Error updating consultant:", error);
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "accountId",
      key: "accountId",
      width: 120,
    },
    {
      title: "Tên tài khoản",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Tên tư vấn viên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <StatusTag status={status} options={HUMAN_STATUS} />,
    },
    {
      title: "Hành động",
      key: "action",
      width: 180,
      render: (_, record) => (
        <ActionButtons
          onView={() => showDetailModal(record)}
          onEdit={() => showEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý tư vấn viên</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Search
            placeholder="Tìm kiếm tên và email..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            className="w-full md:w-64"
          />
          <Button
            type="primary"
            className="bg-green-600"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
          >
            Tạo tư vấn viên mới
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={searchText ? filteredStaffs : staffs}
        rowKey="accountId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong ${total} tư vấn viên`,
        }}
        locale={{
          emptyText: searchText ? 'Không tìm thấy tư vấn viên phù hợp' : 'Không có dữ liệu'
        }}
      />

      <Modal
        title={
          isRegistering
            ? "Tạo tư vấn viên mới"
            : `Chỉnh sửa thông tin ${editingUser?.fullName || ""}`
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={700}
        footer={null}
      >
        {isRegistering ? (
          <Formik
            initialValues={{ ...updateFormValues, ...editingUser }}
            validationSchema={staffSchema.concat(certificateSchema)}
            onSubmit={handleRegister}
            enableReinitialize
          >
            {(formik) => (
              <>
                <RegistrationForm
                  formik={formik}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={handleCancel} className="mr-2">
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => formik.handleSubmit()}
                    loading={formik.isSubmitting}
                    disabled={!formik.isValid || formik.isSubmitting}
                  >
                    Tạo tư vấn viên
                  </Button>
                </div>
              </>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ ...updateFormValues, ...editingUser }}
            validationSchema={statusSchema}
            onSubmit={handleUpdate}
            enableReinitialize
          >
            {(formik) => (
              <UpdateForm formik={formik} />
            )}
          </Formik>
        )}
      </Modal>

      {/* Consultant Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <SolutionOutlined className="mr-2" />
            <span>Thông tin chi tiết tư vấn viên</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>,
        ]}
        width={700}
        style={{ top: 20 }}
      >
        {selectedConsultant && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <UserOutlined className="text-3xl text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedConsultant.fullName}
                </h2>
                <div className="flex items-center">
                  <span className="mr-2">Trạng thái:</span>
                  <StatusTag
                    status={selectedConsultant.status}
                    options={HUMAN_STATUS}
                  />
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin chung" key="1">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="ID">
                    <span className="font-mono">
                      {selectedConsultant.accountId}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên tài khoản">
                    {selectedConsultant.userName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">
                    {selectedConsultant.fullName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <div className="flex items-center">
                      <MailOutlined className="mr-2" />
                      {selectedConsultant.email || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2" />
                      {selectedConsultant.phone || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    <div className="flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      {selectedConsultant.address || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane tab="Thông tin bổ sung" key="2">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-gray-600">
                    <SolutionOutlined className="mr-2" />
                    <span className="font-medium">Vai trò:</span> Tư vấn viên
                  </p>
                  <p className="text-gray-600 mt-2">
                    <CalendarOutlined className="mr-2" />
                    <span className="font-medium">Ngày tạo:</span>{" "}
                    {selectedConsultant.createdAt
                      ? new Date(selectedConsultant.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "Chưa cập nhật"}
                  </p>
                  {selectedConsultant.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Ghi chú</h4>
                      <p className="text-gray-600">
                        {selectedConsultant.notes}
                      </p>
                    </div>
                  )}
                </div>
              </TabPane>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailModalClose();
                  showEditModal(selectedConsultant);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageConsultant;
