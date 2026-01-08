import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  ConfigProvider,
  message,
} from "antd";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  FormOutlined,
  LogoutOutlined,
  DollarOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import ManageManager from "./ManageManager";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [headerTitle, setHeaderTitle] = useState("Dashboard Overview");
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalConsultations: 0,
  });

  // Fetch statistics data
  const fetchStatsData = useCallback(async () => {
    const defaultStats = {
      totalUsers: 0,
      totalBookings: 0,
      totalBookingAmount: 0,
      totalConsultations: 0,
      totalConsultationAmount: 0,
    };

    try {
      // Create an array of promises that never reject
      const promises = [
        // Users count (simple count)
        api
          .get("admin/statistic-reports/users/count")
          .then((res) => ({
            type: "users",
            data: res.data,
            amount: 0,
          }))
          .catch((error) => {
            console.error("Error fetching users count:", error);
            return { type: "users", data: 0, amount: 0 };
          }),

        // Bookings data with amount and count
        api
          .get("admin/statistic-reports/testing-service-bookings", {
            params: { periodByDays: 30 },
          })
          .then((res) => {
            console.log(res.data);
            const data = Array.isArray(res?.data) ? res.data : [];
            const totalCount = data.reduce((sum, item) => sum + (item.totalCount || 0), 0);
            const totalAmount = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
            return {
              type: "bookings",
              data: totalCount,
              amount: totalAmount,
            };
          })
          .catch((error) => {
            console.error("Error fetching bookings data:", error);
            return { type: "bookings", data: 0, amount: 0 };
          }),

        // Consultations data with amount and count
        api
          .get("admin/statistic-reports/consultations", {
            params: { periodByDays: 30 },
          })
          .then((res) => {
            console.log(res.data);
            const data = Array.isArray(res?.data) ? res.data : [];
            const totalCount = data.reduce((sum, item) => sum + (item.totalCount || 0), 0);
            const totalAmount = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
            return {
              type: "consultations",
              data: totalCount,
              amount: totalAmount,
            };
          })
          .catch((error) => {
            console.error("Error fetching consultations data:", error);
            return { type: "consultations", data: 0, amount: 0 };
          }),
      ];

      // Wait for all promises to settle
      const results = await Promise.all(promises);

      // Process results
      const newStats = { ...defaultStats };
      results.forEach((result) => {
        if (!result) return;
        
        switch (result.type) {
          case "users":
            newStats.totalUsers = result.data || 0;
            break;
          case "bookings":
            newStats.totalBookings = result.data || 0;
            newStats.totalBookingAmount = result.amount || 0;
            break;
          case "consultations":
            newStats.totalConsultations = result.data || 0;
            newStats.totalConsultationAmount = result.amount || 0;
            break;
        }
      });

      setStatsData(newStats);

      // Show warning if any API call failed
      const failedCalls = results.filter((r) => r && r.error);
      if (failedCalls.length > 0) {
        message.warning(
          `Không thể tải một số dữ liệu thống kê (${failedCalls.length}/3)`
        );
      }
    } catch (error) {
      console.error("Unexpected error in fetchStatsData:", error);
      message.error("Đã xảy ra lỗi khi tải dữ liệu thống kê");
    }
  }, []);

  useEffect(() => {
    if (selectedTab === "dashboard") {
      fetchStatsData();
    }
  }, [selectedTab, fetchStatsData]);

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  const stats = [
    {
      title: "Tổng khách hàng",
      value: statsData.totalUsers,
      icon: <TeamOutlined />,
      color: "#722ed1",
      suffix: "người",
      precision: 0
    },
    {
      title: "Tổng đơn đặt lịch",
      value: statsData.totalBookings,
      icon: <ShoppingCartOutlined />,
      color: "#1890ff",
      suffix: "đơn",
      precision: 0
    },
    {
      title: "Tổng tư vấn",
      value: statsData.totalConsultations,
      icon: <FileTextOutlined />,
      color: "#52c41a",
      suffix: "cuộc",
      precision: 0
    },
    {
      title: "Tổng doanh thu",
      value: statsData.totalBookingAmount + statsData.totalConsultationAmount,
      icon: <DollarOutlined />,
      color: "#fa8c16",
      prefix: "₫",
      precision: 0,
      formatter: (value) => {
        // Format as VND currency
        return new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND',
          maximumFractionDigits: 0
        }).format(value);
      }
    },
  ];

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
                dashboard: "Tổng quan",
                managers: "Quản lý người quản lý",
              };
              setHeaderTitle(titles[key] || "Tổng quan");
            }}
          >
            <Menu.Item
              key="dashboard"
              icon={
                <DashboardOutlined
                  className={
                    selectedTab === "dashboard"
                      ? "text-white"
                      : "text-green-600"
                  }
                />
              }
            >
              Tổng quan
            </Menu.Item>
            <Menu.Item
              key="managers"
              icon={
                <FormOutlined
                  className={
                    selectedTab === "managers" ? "text-white" : "text-green-600"
                  }
                />
              }
            >
              Quản lý người quản lý
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
              Chào quản trị viên <b>{user.fullname}</b>
            </span>
            <Avatar src={user.avatarUrl} className="bg-green-600 mr-2">
              {user.fullname?.charAt(0) || "U"}
            </Avatar>
          </div>
        </Header>

        <Content className="p-6">
          {selectedTab === "dashboard" && (
            <>
              {/* Stats Cards */}
              <Row gutter={[16, 16]} className="mb-6">
                {stats.map((stat, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
                      <Statistic
                        title={stat.title}
                        value={stat.value}
                        valueStyle={{ color: stat.color }}
                        prefix={stat.prefix ? stat.icon : null}
                        suffix={stat.suffix || null}
                        formatter={stat.formatter}
                        precision={stat.precision}
                        className="text-lg"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Quick Actions */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Hành động nhanh" className="shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border rounded text-center hover:bg-green-50 hover:border-green-200 transition-colors">
                        <FileTextOutlined className="text-green-600 text-xl mb-2" />
                        <p>Tạo báo cáo</p>
                      </button>
                      <button className="p-4 border rounded text-center hover:bg-green-50 hover:border-green-200 transition-colors">
                        <BellOutlined className="text-green-600 text-xl mb-2" />
                        <p>Gửi thông báo</p>
                      </button>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]} className="mt-4">
                <Col xs={24}>
                  <Card title="Thống kê tổng quan" className="shadow-sm">
                    <p className="text-gray-600">
                      Dữ liệu được cập nhật theo thời gian thực
                    </p>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {selectedTab === "managers" && (
            <Card title="Quản lý người quản lý" className="shadow-sm">
              <div className="p-4">
                <ManageManager />
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManagerDashboard;
