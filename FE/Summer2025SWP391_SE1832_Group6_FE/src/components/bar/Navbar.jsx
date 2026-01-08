import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import { MenuOutlined, GlobalOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown, Typography } from "antd";

// Main navigation links
const { Title } = Typography;



const Navbar = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const showDashboard =
    user?.role === "MANAGER" ||
    user?.role === "CONSULTANT" ||
    user?.role === "ADMIN" ||
    user?.role === "STAFF";
  const dashboardLink = {
    MANAGER: "/dashboard",
    CONSULTANT: "/consultant/dashboard",
    ADMIN: "/admin/dashboard",
    STAFF: "/staff/dashboard",
  }[user?.role];
  const navigation = [
    { name: "Blog", href: "/blog" },
    { name: "Tư vấn", href: "/consultant" },
    // { name: "Đặt lịch xét nghiệm", href: "/test-booking" },
    { name: "Đặt lịch tư vấn", href: "/consultant-booking" },
  ];

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Skeleton */}
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gray-200 rounded-md w-24 h-8 animate-pulse"></div>
            </div>

            {/* Navigation Items Skeleton */}
            <div className="hidden lg:flex flex-1 items-center justify-center space-x-8">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-4 bg-gray-200 rounded w-24 animate-pulse"
                ></div>
              ))}
            </div>

            {/* Auth Buttons Skeleton */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="h-9 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              <div className="h-9 bg-blue-600 rounded-full w-24 animate-pulse"></div>
            </div>

            {/* Mobile Menu Button Skeleton */}
            <div className="lg:hidden">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-green-600 px-2 text-2xl font-extrabold tracking-tight font-sans leading-none select-none">
                GHS
              </span>
            </Link>
          </div>
          {/* Desktop Nav */}
          <div className="hidden lg:flex flex-1 items-center justify-center space-x-8">
            {navigation.map((item) =>
              item.dropdown ? (
                <Dropdown
                  key={item.name}
                  menu={{
                    items: item.dropdown.map((sub) => ({
                      key: sub.name,
                      label: <Link to={sub.href}>{sub.name}</Link>,
                    })),
                  }}
                  trigger={["hover"]}
                >
                  <span className="text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition cursor-pointer flex items-center">
                    {item.name} <DownOutlined className="ml-1 text-xs" />
                  </span>
                </Dropdown>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {showDashboard && (
              <Link
                to={dashboardLink}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Dropdown
                  key={"profile"}
                  menu={{
                    items: [
                      {
                        key: "profile",
                        label: <Link to="/profile">Hồ sơ</Link>,
                      },
                      {
                        key: "logout",
                        label: (
                          <button
                            onClick={logout}
                            className="text-red-600 font-semibold"
                          >
                            Đăng xuất
                          </button>
                        ),
                      },
                    ],
                  }}
                  trigger={["hover"]}
                >
                  <span className="text-gray-700 font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition cursor-pointer flex items-center gap-2">
                    <span>
                      {user.role === "CUSTOMER" ? (
                        <>
                          Chào khách hàng <b>{user.username}</b>
                        </>
                      ) : user.role === "CONSULTANT" ? (
                        <>
                          Chào tư vấn viên <b>{user.username}</b>
                        </>
                      ) : user.role === "MANAGER" ? (
                        <>
                          Chào quản lý <b>{user.username}</b>
                        </>
                      ) : (
                        <>
                          Chào admin <b>{user.username}</b>
                        </>
                      )}
                    </span>
                    <DownOutlined className="ml-2 text-xs" />
                  </span>
                </Dropdown>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
          {/* Mobile Hamburger */}
          <div className="flex lg:hidden">
            <Dropdown
              menu={{
                items: [
                  ...navigation.map((item) =>
                    item.dropdown
                      ? {
                          key: item.name,
                          label: (
                            <Dropdown
                              menu={{
                                items: item.dropdown.map((sub) => ({
                                  key: sub.name,
                                  label: <Link to={sub.href}>{sub.name}</Link>,
                                })),
                              }}
                              trigger={["click"]}
                            >
                              <span>
                                {item.name}{" "}
                                <DownOutlined style={{ fontSize: 12 }} />
                              </span>
                            </Dropdown>
                          ),
                        }
                      : {
                          key: item.name,
                          label: <Link to={item.href}>{item.name}</Link>,
                        }
                  ),
                  { type: "divider" },
                  user
                    ? {
                        key: "profile",
                        label: <Link to="/profile">Hồ sơ</Link>,
                      }
                    : {
                        key: "login",
                        label: <Link to="/login">Đăng nhập</Link>,
                      },
                  user
                    ? {
                        key: "logout",
                        label: (
                          <button
                            onClick={logout}
                            className="text-red-600 font-semibold"
                          >
                            Đăng xuất
                          </button>
                        ),
                      }
                    : {
                        key: "register",
                        label: (
                          <Link
                            to="/register"
                            className="text-green-600 font-semibold"
                          >
                            Đăng ký
                          </Link>
                        ),
                      },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <MenuOutlined className="text-2xl text-gray-700 cursor-pointer" />
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
