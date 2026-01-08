import React, { useState, useContext } from "react";
import { Layout, Menu, Card, Avatar, Typography, ConfigProvider } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { TeamOutlined, FormOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import ManageSchedule from "./ManageSchedule";
import ConsultantProfile from "./ConsultantProfile";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const ConsultantDashboard = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("schedule");
  const [headerTitle, setHeaderTitle] = useState("Quản lý lịch");

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
            Bảng điều khiển cho tư vấn viên
          </Title>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemSelectedBg: "#16a34a",
                itemSelectedColor: "#ffffff",
                itemHoverBg: "#f0fdf4", // green-50
                itemHoverColor: "#15803d", // green-700
              },
            },
          }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedTab]}
            onClick={({ key }) => {
              setSelectedTab(key);
              // Update header title based on selected tab
              const titles = {
                schedule: "Quản lý lịch",
                profile: "Thông tin cá nhân",
              };
              setHeaderTitle(titles[key] || "Quản lý lịch");
            }}
          >
            <Menu.Item
              key="schedule"
              icon={
                <FormOutlined
                  className={
                    selectedTab === "schedule" ? "text-white" : "text-green-600"
                  }
                />
              }
            >
              Quản lý lịch
            </Menu.Item>
            <Menu.Item
              key="profile"
              icon={
                <TeamOutlined
                  className={
                    selectedTab === "profile" ? "text-white" : "text-green-600"
                  }
                />
              }
            >
              Thông tin cá nhân
            </Menu.Item>
            <Menu.Item
              key="logout"
              icon={<LogoutOutlined className="text-red-500" />}
              className="mt-4"
              onClick={() => logout()}
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
              Chào tư vấn viên <b>{user.fullname}</b>
            </span>
            <Avatar src={user.avatarUrl} className="bg-green-600 mr-2">
              {user.fullname?.charAt(0) || "U"}
            </Avatar>
          </div>
        </Header>

        <Content className="p-6">
          {selectedTab === "schedule" && (
            <Card title="Quản lý lịch" className="shadow-sm">
              <div className="p-4">
                <ManageSchedule />
              </div>
            </Card>
          )}

          {selectedTab === "profile" && (
            <Card title="Thông tin cá nhân" className="shadow-sm">
              <div className="p-4">
                <ConsultantProfile />
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ConsultantDashboard;
