import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Card, Avatar, Typography, ConfigProvider } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { TeamOutlined, UserOutlined, FormOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import ManageUser from "./ManageUser";
import ManageBlog from "./ManageBlog";
import ManageStaff from "./ManageStaff";
import ManageConsultant from "./ManageConsultant";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ManagerDashboard = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("staffs");
  const [headerTitle, setHeaderTitle] = useState("Quản lý nhân viên");

  const handleMenuClick = (e) => {
    const key = e.key;
    if (key === 'logout') {
      logout();
      navigate('/login');
      return;
    }
    setSelectedTab(key);
    const titles = {
      staffs: "Quản lý nhân viên",
      consultants: "Quản lý tư vấn viên",
      users: "Quản lý người dùng",
      blog: "Quản lý blog",
    };
    setHeaderTitle(titles[key] || "Quản lý nhân viên");
  };

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        className="bg-white shadow-md"
        width={250}
        breakpoint="lg"
        collapsedWidth="0"
        zeroWidthTriggerStyle={{ backgroundColor: "white", color: "green" }}
      >
        <div className="p-4">
          <Title level={4} className="text-green-600 text-center">
            Bảng điều khiển cho quản trị viên
          </Title>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemSelectedBg: "#16a34a",
                itemSelectedColor: "#ffffff",
                itemHoverBg: "#f0fdf4",
                itemHoverColor: "#15803d",
              },
            },
          }}
        >
          <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[selectedTab]}
          onClick={handleMenuClick}
          selectedKeys={[selectedTab]}
        >
          <Menu.Item
            key="staffs"
            icon={
              <TeamOutlined
                className={
                  selectedTab === "staffs" ? "text-white" : "text-green-600"
                }
              />
            }
          >
            Quản lý nhân viên
          </Menu.Item>
          <Menu.Item
            key="consultants"
            icon={
              <TeamOutlined
                className={
                  selectedTab === "consultants"
                    ? "text-white"
                    : "text-green-600"
                }
              />
            }
          >
            Quản lý tư vấn viên
          </Menu.Item>
          <Menu.Item
            key="users"
            icon={
              <UserOutlined
                className={
                  selectedTab === "users" ? "text-white" : "text-green-600"
                }
              />
            }
          >
            Quản lý người dùng
          </Menu.Item>
          <Menu.Item
            key="blog"
            icon={
              <FormOutlined
                className={
                  selectedTab === "blog" ? "text-white" : "text-green-600"
                }
              />
            }
          >
            Quản lý blog
          </Menu.Item>
          <Menu.Item
            key="logout"
            icon={<LogoutOutlined className="text-red-500" />}
            className="mt-4"
          >
            Đăng xuất
          </Menu.Item>
        </Menu>
        </ConfigProvider>
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm flex justify-between items-center px-6">
          <Title level={4} className="mb-0">
            {headerTitle}
          </Title>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              Chào quản lý <b>{user.fullname}</b>
            </span>
            <Avatar src={user.avatarUrl} className="bg-green-600 mr-2">
              {user.fullname?.charAt(0) || "U"}
            </Avatar>
          </div>
        </Header>

        <Content className="p-6">
          {selectedTab === "staffs" && (
            <Card title="Quản lý nhân viên" className="shadow-sm">
              <div className="p-4">
                <ManageStaff />
              </div>
            </Card>
          )}

          {selectedTab === "consultants" && (
            <Card title="Quản lý tư vấn viên" className="shadow-sm">
              <div className="p-4">
                <ManageConsultant />
              </div>
            </Card>
          )}

          {selectedTab === "users" && (
            <Card title="Quản lý người dùng" className="shadow-sm">
              <div className="p-4">
                <ManageUser />
              </div>
            </Card>
          )}

          {selectedTab === "blog" && (
            <Card title="Quản lý blog" className="shadow-sm">
              <div className="p-4">
                <ManageBlog />
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerDashboard;
