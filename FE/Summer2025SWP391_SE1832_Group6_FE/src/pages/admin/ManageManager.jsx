import React, { useState, useEffect, useCallback, useContext } from "react";
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
  Table,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { StatusTag, ActionButtons } from "../../components/common/DataTable";
import { HUMAN_STATUS } from "../../constants/statusOptions";
import { managerSchema, updateSchema } from "../../constants/commonSchemas";

const { TabPane } = Tabs;
const { Option } = Select;

// Registration Form Component
const RegistrationForm = ({ handleFormSubmit, isSubmitting }) => (
  <Formik
    initialValues={{
      username: "",
      password: "",
      fullName: "",
      phone: "",
      email: "",
      address: "",
      status: "ACTIVE",
    }}
    validationSchema={managerSchema}
    onSubmit={handleFormSubmit}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setFieldTouched,
    }) => (
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Tên tài khoản"
          validateStatus={touched.username && errors.username ? "error" : ""}
          help={touched.username && errors.username}
        >
          <Input
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập tên tài khoản"
          />
        </Form.Item>

        <Form.Item
          label="Tên nhân viên"
          validateStatus={touched.fullName && errors.fullName ? "error" : ""}
          help={touched.fullName && errors.fullName}
        >
          <Input
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập tên nhân viên"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          validateStatus={touched.password && errors.password ? "error" : ""}
          help={touched.password && errors.password}
        >
          <Input.Password
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          validateStatus={touched.phone && errors.phone ? "error" : ""}
          help={touched.phone && errors.phone}
        >
          <Input
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          validateStatus={touched.email && errors.email ? "error" : ""}
          help={touched.email && errors.email}
        >
          <Input
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập email"
            type="email"
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          validateStatus={touched.address && errors.address ? "error" : ""}
          help={touched.address && errors.address}
        >
          <Input
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập địa chỉ"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          validateStatus={touched.status && errors.status ? "error" : ""}
          help={touched.status && errors.status}
        >
          <Select
            name="status"
            value={values.status}
            onChange={(value) => setFieldValue("status", value)}
            onBlur={() => setFieldTouched("status", true)}
            placeholder="Chọn trạng thái"
          >
            <Option value="ACTIVE">Hoạt động</Option>
            <Option value="UNACTIVE">Không hoạt động</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    )}
  </Formik>
);

// Update Form Component
const UpdateForm = ({ initialValues, handleFormSubmit, isSubmitting }) => (
  <Formik
    initialValues={{
      fullName: initialValues?.fullName || "",
      phone: initialValues?.phone || "",
      email: initialValues?.email || "",
      address: initialValues?.address || "",
      status: initialValues?.status || "ACTIVE",
    }}
    validationSchema={updateSchema}
    onSubmit={handleFormSubmit}
    enableReinitialize
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setFieldTouched,
    }) => (
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Tên nhân viên"
          validateStatus={touched.fullName && errors.fullName ? "error" : ""}
          help={touched.fullName && errors.fullName}
        >
          <Input
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập tên nhân viên"
          />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          validateStatus={touched.phone && errors.phone ? "error" : ""}
          help={touched.phone && errors.phone}
        >
          <Input
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          validateStatus={touched.email && errors.email ? "error" : ""}
          help={touched.email && errors.email}
        >
          <Input
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập email"
            type="email"
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          validateStatus={touched.address && errors.address ? "error" : ""}
          help={touched.address && errors.address}
        >
          <Input
            name="address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập địa chỉ"
          />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          validateStatus={touched.status && errors.status ? "error" : ""}
          help={touched.status && errors.status}
        >
          <Select
            name="status"
            value={values.status}
            onChange={(value) => setFieldValue("status", value)}
            onBlur={() => setFieldTouched("status", true)}
            placeholder="Chọn trạng thái"
          >
            {HUMAN_STATUS.map(
              (option) =>
                option.value !== "DELETED" && (
                  <Option key={option.value} value={option.value}>
                    <Tag color={option.color}>{option.label}</Tag>
                  </Option>
                )
            )}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    )}
  </Formik>
);

const ManageManager = () => {
  // State management
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchText(value);
  }, []);
  
  // Filter managers based on search text
  const filterManagers = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredManagers(managers);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = managers.filter(manager => {
      return [
        manager.accountId?.toString(),
        manager.userName,
        manager.fullName,
        manager.email,
        manager.phone,
        manager.status,
        manager.address
      ].some(field => field && field.toString().toLowerCase().includes(searchLower));
    });
    
    setFilteredManagers(filtered);
  }, [searchText, managers]);
  
  // Apply filters when search text or managers change
  useEffect(() => {
    filterManagers();
  }, [filterManagers]);

  // MODAL
  const showDetailModal = (manager) => {
    api
      .get(`/admin/managers/${manager.accountId}`)
      .then((response) => {
        setSelectedManager(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching manager details:", error);
        message.error("Lỗi khi tải thông tin quản lý");
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedManager(null);
  };

  // GET MANAGERS
  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        sort: "accountId",
        order: "asc",
      };
      const response = await api.get(`/admin/managers/`, { params });
      const managersData = response.data.managers || [];
      setManagers(managersData);
      setFilteredManagers(managersData);
    } catch (error) {
      console.error("Error fetching managers:", error);
      message.error("Lỗi khi tải danh sách quản lý");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  // EVENT HANDLERS
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsRegistering(false);
    setIsModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setIsRegistering(true);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setIsRegistering(false);
  };

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // FORM SUBMISSION
  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setIsSubmitting(true);

      if (isRegistering) {
        await api.post("/admin/managers/register", values);
        message.success("Tạo quản lý thành công");
      } else if (editingUser) {
        await api.post(
          `/admin/managers/update/${editingUser.accountId}`,
          values
        );
        message.success("Cập nhật quản lý thành công");
      }

      setIsModalVisible(false);
      resetForm();
      fetchManagers();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };



  // RENDER COLUMN
  const columns = [
    {
      title: "ID",
      dataIndex: "accountId",
      key: "accountId",
      width: 100,
    },
    {
      title: "Tên tài khoản",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <div
          style={{
            maxWidth: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
            position: "relative",
          }}
          title={email}
        >
          {email}
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
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
          onEdit={() => handleEdit(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <div className="w-full md:w-96">
          <Input.Search
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            enterButton
            className="w-full"
          />
        </div>
        <Button
          type="primary"
          className="bg-green-600 w-full md:w-auto"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
        >
          Tạo nhân viên mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={searchText ? filteredManagers : managers}
        rowKey="accountId"
        loading={loading}
        bordered
        locale={{
          emptyText: searchText 
            ? 'Không tìm thấy nhân viên nào phù hợp' 
            : 'Không có dữ liệu nhân viên'
        }}
      />

      <Modal
        title={
          isRegistering
            ? "Tạo quản lý mới"
            : `Chỉnh sửa thông tin ${editingUser?.fullName || ""}`
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {isRegistering ? (
          <RegistrationForm
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <UpdateForm
            initialValues={editingUser || {}}
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Staff Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2" />
            <span>Thông tin chi tiết quản lý</span>
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
        {selectedManager && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <UserOutlined className="text-3xl text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedManager.fullName}
                </h2>
                <div className="flex items-center">
                  <span className="mr-2">Trạng thái:</span>
                  <StatusTag
                    status={selectedManager.status || "ACTIVE"}
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
                      {selectedManager.accountId}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên tài khoản">
                    {selectedManager.userName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">
                    {selectedManager.fullName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <div className="flex items-center">
                      <MailOutlined className="mr-2" />
                      {selectedManager.email || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2" />
                      {selectedManager.phone || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    <div className="flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      {selectedManager.address || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane tab="Thông tin bổ sung" key="2">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-gray-600">
                    <IdcardOutlined className="mr-2" />
                    <span className="font-medium">Vai trò:</span> Quản lý
                  </p>
                </div>
              </TabPane>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailModalClose();
                  handleEdit(selectedManager);
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

export default ManageManager;
