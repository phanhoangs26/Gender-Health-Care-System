import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, Typography, Pagination, Input } from "antd";
import api from "../api/axios";

const { Title, Paragraph } = Typography;
const { Search } = Input;

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9, // 9 items per page for 3x3 grid
    total: 0,
    totalPages: 1,
  });

  const fetchBlogs = useCallback(
    async (page = 0, search = "") => {
      try {
        setLoading(true);
        const params = {
          page: page,
          sort: "blogId",
          order: "desc",
        };

        if (search) {
          params.keyword = search;
          const response = await api.get(`/blogs/public/search`, { params });
          setBlogs(response.data.blogs || []);
          setPagination((prevPagination) => ({
            ...prevPagination,
            current: response.data.currentPage + 1, // API is 0-based, Pagination is 1-based
            total: response.data.totalItems,
            totalPages: response.data.totalPages,
          }));
          return;
        }

        const response = await api.get(`/blogs/public`, { params });

        setBlogs(response.data.blogs || []);
        setPagination((prevPagination) => ({
          ...prevPagination,
          current: response.data.currentPage + 1, // API is 0-based, Pagination is 1-based
          total: response.data.totalItems,
          totalPages: response.data.totalPages,
        }));
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchBlogs(0, searchTerm);
  }, [searchTerm, fetchBlogs]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Reset to first page when searching
    fetchBlogs(0, value);
  };

  const handlePageChange = (page) => {
    fetchBlogs(page - 1, searchTerm); // Convert to 0-based for API
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      {/* Header Section */}
      <Card className="max-w-full mx-auto mb-12 text-center" variant={false}>
        <Title level={1} className="text-green-600">
          Chào mừng đến với Blog của chúng tôi
        </Title>
        <Paragraph className="text-lg text-gray-600">
          Khám phá những hiểu biết chuyên sâu, lời khuyên và tài nguyên giúp bạn
          định hướng hành trình hướng tới sức khỏe, sự khỏe mạnh và phát triển
          cá nhân. Luôn cập nhật và được truyền cảm hứng với các bài viết được
          chọn lọc của chúng tôi.
        </Paragraph>
      </Card>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bài viết
            </label>
            <Search
              placeholder="Nhập từ khóa..."
              allowClear
              enterButton="Tìm kiếm"
              size="large"
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-center text-gray-500">Đang tải bài viết...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs && blogs.length > 0 ? (
                blogs.map((blog) => (
                  <Link
                    to={`/blog/${blog.blogId}`}
                    key={blog.blogId}
                    className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        className="w-full h-48 md:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                        src={
                          blog.thumbnail ||
                          "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png"
                        }
                        alt={blog.title}
                      />
                      {blog.status === "INACTIVE" && (
                        <span className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded">
                          Đang ẩn
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl min-h-15 font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed h-25 overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: blog.content || "Không có mô tả" }}></div>
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {blog.createdAt}
                        </span>
                        <span>
                          Tạo bởi {blog.manager?.fullName || "Quản trị viên"}
                        </span>
                      </div>
                      <div className="mt-4 text-green-600 font-medium group-hover:underline">
                        Đọc thêm &rarr;
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">
                    Không tìm thấy bài viết nào phù hợp
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="mt-6"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
