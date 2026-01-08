import React, { useState, useContext, useEffect } from "react";
import { Layout, Menu, Card, Avatar, Typography, ConfigProvider } from "antd";
import { AuthContext } from "../../../context/AuthContext";
import { TeamOutlined, FormOutlined, LogoutOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import ConsultantBooking from "./ConsultantBooking";
import ConsultationHistory from "./ConsultationHistory";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("book");

  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
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
            }}
          >
            <Menu.Item
              key="book"
              icon={
                <FormOutlined
                  className={
                    selectedTab === "book" ? "text-white" : "text-green-600"
                  }
                />
              }
            >
              Đặt lịch tư vấn
            </Menu.Item>
            <Menu.Item
              key="history"
              icon={
                <TeamOutlined
                  className={
                    selectedTab === "history" ? "text-white" : "text-green-600"
                  }
                />
              }
            >
              Lịch sử đặt lịch
            </Menu.Item>
          </Menu>
        </ConfigProvider>
      </Sider>

      <Layout>
        <Content className="p-6">
          {selectedTab === "book" && (
            <Card className="shadow-lg">
              <div className="p-4">
                <ConsultantBooking />
              </div>
            </Card>
          )}

          {selectedTab === "history" && (
            <div className="p-4">
              <ConsultationHistory />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPage;
