import React, { useState, useEffect, useCallback } from "react";
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
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
import api from "../../api/axios";
import { ActionButtons, StatusTag } from "../../components/common/DataTable";
import { HUMAN_STATUS } from "../../constants/statusOptions";

const { Option } = Select;
const { TextArea, Search } = Input;

const ManageUser = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // GET CUSTOMERS
  const fetchCustomers = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        sort: "accountId",
        order: "asc",
      };

      const response = await api.get(`/manager/customers/`, { params });
      const customersData = response.data.customers || [];
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      error.response.status === 404 ? message.error("Không tìm thấy người dùng") : message.error("Không thể tải danh sách người dùng");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
}, []);

useEffect(() => {
  fetchCustomers();
}, [fetchCustomers]);

  // MODAL
  const showDetailModal = (user) => {
    api
      .get(`/manager/customers/${user.accountId}`)
      .then((response) => {
        setSelectedUser(response.data);
        console.log(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
        message.error("Failed to load user details");
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedUser(null);
  };

  // EVENT HANDLER
  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      status: user.status || "ACTIVE",
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // FORM API
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await api.post(
        `/manager/customers/update_status/${editingUser.accountId}?status=${values.status}`
      );

      message.success("Cập nhật trạng thái thành công");
      await fetchCustomers();
      handleCancel();
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search text
  const filterCustomers = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => 
      Object.values(customer).some(value => 
        value && 
        typeof value === 'string' && 
        value.toLowerCase().includes(searchText.toLowerCase())
      ) ||
      (customer.fullName && 
       customer.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
      (customer.email && 
       customer.email.toLowerCase().includes(searchText.toLowerCase())) ||
      (customer.phone && 
       customer.phone.includes(searchText)) ||
      (customer.userName &&
       customer.userName.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    setFilteredCustomers(filtered);
  }, [searchText, customers]);

  // Update filtered customers when search text or customers change
  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  // RENDER COLUMNS
  const columns = [
    {
      title: "ID",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "Tên tài khoản",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        return <Tag color={gender === "MALE" ? "blue" : "pink"}>{gender}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status} options={HUMAN_STATUS} />,
    },
    {
      title: "Hành động",
      key: "action",
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
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <div className="w-full md:w-64">
          <Search
            placeholder="Tìm kiếm khách hàng..."
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            value={searchText}
            allowClear
            className="w-full"
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={searchText ? filteredCustomers : customers}
        rowKey="accountId"
        loading={loading}
        bordered
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong ${total} khách hàng`,
        }}
        locale={{
          emptyText: searchText ? 'Không tìm thấy khách hàng phù hợp' : 'Không có dữ liệu'
        }}
      />

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2" />
            <span>Thông tin chi tiết khách hàng</span>
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
        {selectedUser && (
          <div>
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <UserOutlined className="text-3xl text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedUser.fullName}
                </h2>
                <div className="flex items-center">
                  <span className="mr-2">Trạng thái:</span>
                  <StatusTag status={selectedUser.status || "ACTIVE"} options={HUMAN_STATUS} />
                </div>
              </div>
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">
                <span className="font-mono">{selectedUser.accountId}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Họ và tên">
                {selectedUser.fullName || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  {selectedUser.email || "Chưa cập nhật"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  {selectedUser.phone || "Chưa cập nhật"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  {selectedUser.address || "Chưa cập nhật"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {selectedUser.dateOfBirth
                    ? new Date(selectedUser.dateOfBirth).toLocaleDateString(
                        "vi-VN"
                      )
                    : "Chưa cập nhật"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedUser.gender || "Chưa cập nhật"}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailModalClose();
                  showEditModal(selectedUser);
                }}
              >
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EditOutlined className="mr-2" />
            <span>Cập nhật trạng thái - {editingUser?.fullName || ""}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {HUMAN_STATUS.map((option) => option.value !== "DELETED" && (
                <Option key={option.value} value={option.value}>
                  <Tag color={option.color}>{option.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ManageUser;
