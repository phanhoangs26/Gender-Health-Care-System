import React, { useState, useContext } from "react";
import {
  Layout,
  Menu,
  Card,
  Avatar,
  Typography,
  ConfigProvider,
} from "antd";
import { AuthContext } from "../../context/AuthContext";
import {
  FormOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import ManageOwnedTestBooking from "./ManageOwnedTestBooking";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const StaffDashboard = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("testBooking");
  const [headerTitle, setHeaderTitle] = useState("Quản lý lịch thử nghiệm");

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
            Bảng điều khiển cho nhân viên
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
                testBooking: "Quản lý lịch thử nghiệm",
              };
              setHeaderTitle(titles[key] || "Quản lý");
            }}
          >
            <Menu.Item
              key="testBooking"
              icon={
                <FormOutlined
                  className={
                    selectedTab === "testBooking"
                      ? "text-white"
                      : "text-green-600"
                  }
                />
              }
            >
              Quản lý lịch thử nghiệm
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
              Chào nhân viên <b>{user.fullname}</b>
            </span>
            <Avatar src={user.avatarUrl} className="bg-green-600 mr-2">
              {user.fullname?.charAt(0) || "U"}
            </Avatar>
          </div>
        </Header>

        <Content className="p-6">
          <Card title="Quản lý lịch thử nghiệm" className="shadow-sm">
            <div className="p-4">
              {selectedTab === "testBooking" && <ManageOwnedTestBooking key="test-booking-manager" />}
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffDashboard;
