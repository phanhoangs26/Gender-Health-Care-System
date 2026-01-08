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
  Table,
  Tabs,
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
import { ActionButtons, StatusTag } from "../../components/common/DataTable";
import { HUMAN_STATUS } from "../../constants/statusOptions";
import { staffSchema, updateSchema } from "../../constants/commonSchemas";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
// Registration Form Component
const RegistrationForm = ({ handleFormSubmit, isSubmitting }) => (
  <Formik
    initialValues={{
      username: "",
      fullName: "",
      password: "",
      phone: "",
      email: "",
      address: "",
    }}
    validationSchema={staffSchema}
    onSubmit={handleFormSubmit}
  >
    {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
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
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập email"
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

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            className="w-full"
          >
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    )}
  </Formik>
);

// Update Form Component
const UpdateForm = ({ initialValues = {}, handleFormSubmit, isSubmitting }) => {
  return (
    <Formik
      initialValues={{
        fullName: initialValues.fullName || "",
        phone: initialValues.phone || "",
        email: initialValues.email || "",
        address: initialValues.address || "",
        status: initialValues.status || "ACTIVE",
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
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập email"
              disabled
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
              {HUMAN_STATUS.map((option) => option.value !== "DELETED" && (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      )}
    </Formik>
  );
};

const { Search } = Input;

const ManageStaff = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GET STAFFS
  const fetchStaffs = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        sort: "accountId",
        order: "asc",
      };

      const response = await api.get(`/manager/staffs/`, { params });
      const staffsData = response.data.staffs || [];
      setStaffs(staffsData);
      setFilteredStaffs(staffsData);
    } catch (error) {
      console.error("Error fetching staffs:", error);
      error.response.status === 404
        ? message.error("Không tìm thấy nhân viên")
        : message.error("Không thể tải danh sách nhân viên");
      setStaffs([]);
      setFilteredStaffs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter staffs based on search text
  const filterStaffs = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredStaffs(staffs);
      return;
    }
    
    const filtered = staffs.filter(staff => 
      Object.values(staff).some(value => 
        value && 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchText.toLowerCase())
      ) ||
      (staff.fullName && 
       staff.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
      (staff.email && 
       staff.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (staff.phone && 
       staff.phone.includes(searchText)) ||
      (staff.userName &&
       staff.userName.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    setFilteredStaffs(filtered);
  }, [searchText, staffs]);

  // Update filtered staffs when search text or staffs change
  useEffect(() => {
    filterStaffs();
  }, [filterStaffs]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // MODAL
  const showDetailModal = (staff) => {
    api
      .get(`/manager/staffs/${staff.accountId}`)
      .then((response) => {
        setSelectedStaff(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching staff details:", error);
        message.error("Failed to load staff details");
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedStaff(null);
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
  };

  const handleAddNew = () => {
    setIsModalVisible(true);
    setIsRegistering(true);
    setEditingUser(null);
  };


  const handleFormSubmit = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);

      if (editingUser) {
        // Update existing staff
        await api.put(`/manager/staffs/update/${editingUser.accountId}`, values);
        message.success("Cập nhật nhân viên thành công");
      } else {
        // Register new staff
        await api.post("/manager/staffs/register", values);
        message.success("Tạo mới nhân viên thành công");
      }

      setIsModalVisible(false);
      setEditingUser(null);
      await fetchStaffs();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  //     await api.post(`/manager/staffs/register`, newStaff);
  //     message.success("Tạo nhân viên mới thành công");
  //     await fetchStaffs();
  //     handleCancel();
  //   } catch (error) {
  //     console.error("Error creating staff:", error);
  //     message.error("Tạo nhân viên thất bại");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleUpdate = async (values) => {
  //   try {
  //     setLoading(true);
  //     const updatedData = { ...values };

  //     // Remove undefined or empty values
  //     Object.keys(updatedData).forEach((key) => {
  //       if (updatedData[key] === undefined || updatedData[key] === "") {
  //         delete updatedData[key];
  //       }
  //     });

  //     await api.put(
  // RENDER COLUMNS
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
          onEdit={() => showEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Search
            placeholder="Tìm kiếm tên, email hoặc số điện thoại..."
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
            Tạo nhân viên mới
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={searchText ? filteredStaffs : staffs}
        rowKey="accountId"
        loading={loading}
        bordered
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong ${total} nhân viên`,
        }}
        locale={{
          emptyText: searchText ? 'Không tìm thấy nhân viên phù hợp' : 'Không có dữ liệu'
        }}
      />

      <Modal
        title={
          isRegistering
            ? "Tạo nhân viên mới"
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
            <span>Thông tin chi tiết nhân viên</span>
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
        {selectedStaff && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <UserOutlined className="text-3xl text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedStaff.fullName}
                </h2>
                <div className="flex items-center">
                  <span className="mr-2">Trạng thái:</span>
                  <StatusTag
                    status={selectedStaff.status}
                    options={HUMAN_STATUS}
                  />
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin chung" key="1">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="ID">
                    <span className="font-mono">{selectedStaff.accountId}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên tài khoản">
                    {selectedStaff.userName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">
                    {selectedStaff.fullName || "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <div className="flex items-center">
                      <MailOutlined className="mr-2" />
                      {selectedStaff.email || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2" />
                      {selectedStaff.phone || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    <div className="flex items-center">
                      <EnvironmentOutlined className="mr-2" />
                      {selectedStaff.address || "Chưa cập nhật"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane tab="Thông tin bổ sung" key="2">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-gray-600">
                    <IdcardOutlined className="mr-2" />
                    <span className="font-medium">Vai trò:</span> Nhân viên
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
                  showEditModal(selectedStaff);
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

export default ManageStaff;
