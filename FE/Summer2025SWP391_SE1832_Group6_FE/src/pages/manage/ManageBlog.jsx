import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Descriptions,
  Table,
  Tag,
  Tabs,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import RichTextEditor from "../../components/common/RichTextEditor";
import api from "../../api/axios";
import AuthContext from "../../context/AuthContext";
import { StatusTag, ActionButtons } from "../../components/common/DataTable";
import { BLOG_STATUS } from "../../constants/statusOptions";
import { blogSchema, updateBlogSchema } from "../../constants/commonSchemas";

const { Search } = Input;
const { TabPane } = Tabs;

// Create Form Component with Formik
const CreateForm = ({ handleFormSubmit, isSubmitting }) => {
  return (
    <Formik
      initialValues={{
        title: "",
        content: "",
      }}
      validationSchema={blogSchema}
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
      }) => (
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Tiêu đề bài viết"
            validateStatus={touched.title && errors.title ? "error" : ""}
            help={touched.title && errors.title}
          >
            <Input
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập tiêu đề bài viết"
            />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            validateStatus={touched.content && errors.content ? "error" : ""}
            help={touched.content && errors.content}
          >
            <div>
              <RichTextEditor
                content={values.content}
                onChange={(html) => {
                  setFieldValue("content", html);
                }}
              />
              {touched.content && errors.content && (
                <div className="ant-form-item-explain-error">
                  {errors.content}
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Tạo bài viết
            </Button>
          </Form.Item>
        </Form>
      )}
    </Formik>
  );
};

// Update Form Component with Formik
const UpdateForm = ({ initialValues = {}, handleFormSubmit, isSubmitting }) => {
  // Log initial values for debugging
  console.log("Initial values in UpdateForm:", initialValues);

  return (
    <Formik
      initialValues={{
        title: initialValues.title || "",
        content: initialValues.content || "",
        status: initialValues.status || "ACTIVE",
      }}
      validationSchema={updateBlogSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
      validateOnMount
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
      }) => (
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Tiêu đề bài viết"
            validateStatus={touched.title && errors.title ? "error" : ""}
            help={touched.title && errors.title}
          >
            <Input
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nhập tiêu đề bài viết"
            />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            validateStatus={touched.content && errors.content ? "error" : ""}
            help={touched.content && errors.content}
          >
            <div>
              <RichTextEditor
                name="content"
                value={values.content}
                onChange={(html) => {
                  console.log("Content changed:", html);
                  setFieldValue("content", html, true);
                }}
              />
              {touched.content && errors.content && (
                <div className="ant-form-item-explain-error">
                  {errors.content}
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            validateStatus={touched.status && errors.status ? "error" : ""}
            help={touched.status && errors.status}
          >
            <Select placeholder="Chọn trạng thái">
              {BLOG_STATUS.map(
                (option) =>
                  option.value !== "DELETED" && (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  )
              )}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Cập nhật bài viết
            </Button>
          </Form.Item>
        </Form>
      )}
    </Formik>
  );
};

const ManageBlog = () => {
  const { user, isAuthenticated } = useContext(AuthContext); // Prefix with _ to indicate unused
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GET BLOGS
  const fetchBlogs = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const params = {
        page: page,
        sort: "blogId",
        order: "asc",
      };

      const response = await api.get(`/blogs/public`, { params });
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      if (error.response?.status === 404) {
        message.error("Không tìm thấy bài viết");
      } else {
        message.error("Không thể tải danh sách bài viết");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  if (!isAuthenticated && window.location.pathname !== "/login") {
    navigate("/login");
    return null;
  }

  // MODAL
  const showDetailModal = (blog) => {
    api
      .get(`/blogs/public/${blog.blogId}`)
      .then((response) => {
        setSelectedBlog(response.data);
        console.log(response.data);
        setIsDetailModalVisible(true);
      })
      .catch((error) => {
        console.error("Error fetching blog details:", error);
        message.error("Failed to load blog details");
      });
  };

  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedBlog(null);
  };

  // EVENT HANDLER
  const showCreateForm = () => {
    setIsCreating(true);
    setEditingBlog(null);
    setIsModalVisible(true);
  };

  const showUpdateForm = (blog) => {
    setIsCreating(false);
    setEditingBlog(blog);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingBlog(null);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa bài viết này?",
      content: "Hành động này không thể hoàn tác.",
      onOk: async () => {
        try {
          await api.delete(`/manager/blogs/delete/${id}`);
          message.success("Xóa bài viết thành công");
          await fetchBlogs();
        } catch (error) {
          console.error("Error deleting blog:", error);
          message.error("Xóa bài viết thất bại");
        }
      },
    });
  };

  // SEARCH
  const handleSearch = async (search) => {
    try {
      setLoading(true);
      const params = {
        page: 0,
        sort: "blogId",
        order: "asc",
      };

      const response = await api.get(`/blogs/public/search?keyword=${search}`, {
        params,
      });

      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      error.response.status === 404
        ? message.error("Không tìm thấy bài viết")
        : message.error("Không thể tìm kiếm bài viết");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission with Formik
  const handleFormSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {
      const apiCall = isCreating
        ? api.post("/manager/blogs/create", {
            ...values,
            author: user?.fullname,
            managerId: user?.id,
          })
        : api.put(`/manager/blogs/update/${editingBlog?.blogId}`, values);

      await apiCall;

      message.success(
        isCreating
          ? "Tạo bài viết thành công!"
          : "Cập nhật bài viết thành công!"
      );

      fetchBlogs();
      handleModalClose();
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu bài viết"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // RENDER COLUMNS
  const columns = [
    {
      title: "Mã bài viết",
      dataIndex: "blogId",
      key: "blogId",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text) => <div className="font-medium line-clamp-2">{text}</div>,
    },
    {
      title: "Người đăng",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status} options={BLOG_STATUS} />,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <ActionButtons
          onView={() => showDetailModal(record)}
          onEdit={() => showUpdateForm(record)}
          onDelete={() => handleDelete(record.blogId)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            onSearch={handleSearch}
            className="w-full md:w-64"
            enterButton
          />
          <Button
            type="primary"
            className="bg-green-600 w-full sm:w-auto"
            icon={<PlusOutlined />}
            onClick={showCreateForm}
          >
            Tạo bài viết mới
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey="blogId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          isCreating
            ? "Tạo bài viết mới"
            : `Chỉnh sửa thông tin ${editingBlog?.title || ""}`
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        {isCreating ? (
          <CreateForm
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <UpdateForm
            initialValues={editingBlog}
            handleFormSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Blog Detail Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2" />
            <span>Chi tiết bài viết</span>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Đóng
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedBlog && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {selectedBlog.title}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <UserOutlined className="mr-1" />
                <span className="mr-4">
                  {selectedBlog.author || "Người đăng: Không xác định"}
                </span>
                <CalendarOutlined className="mr-1" />
                <span>{selectedBlog.createdAt}</span>
                <span className="mx-2">•</span>
                {selectedBlog.status === "ACTIVE" ? (
                  <Tag color="green">Đang hoạt động</Tag>
                ) : (
                  <Tag color="red">Không hoạt động</Tag>
                )}
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Nội dung" key="1">
                <Card className="bg-gray-50">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />
                </Card>
              </TabPane>

              <TabPane tab="Thông tin chi tiết" key="2">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Mã bài viết">
                    <span className="font-mono">{selectedBlog.blogId}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người đăng">
                    <div className="flex items-center">
                      <UserOutlined className="mr-2" />
                      {selectedBlog.author || "Không xác định"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    <div className="flex items-center">
                      <CalendarOutlined className="mr-2" />
                      {selectedBlog.createdAt}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-2">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  handleDetailModalClose();
                  showUpdateForm(selectedBlog);
                }}
              >
                Chỉnh sửa
              </Button>

              <Button
                type="default"
                icon={<LinkOutlined />}
                onClick={() => {
                  handleDetailModalClose();
                  navigate(`/blog/${selectedBlog.blogId}`);
                }}
              >
                Đi đến trang blog
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBlog;
