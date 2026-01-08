import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Row, Col, Image, Button, Divider, Skeleton, Breadcrumb, Spin, Avatar, message } from 'antd';
import {
  HomeOutlined,
  ArrowLeftOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  LinkOutlined,
  MessageOutlined
} from "@ant-design/icons";
import api from "../api/axios";
import CommentsSection from '../components/common/CommentsSection';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format user data for CommentsSection
  const currentUser = user ? {
    id: user.id,
    fullName: user.fullname || 'User',
    avatar: user.avatar,
    role: user.role
  } : null;

  useEffect(() => {
    const fetchBlogAndRelated = async () => {
      try {
        const [blogResponse, relatedResponse] = await Promise.all([
          api.get(`/blogs/public/${id}`),
          api.get('/blogs/public', {
            params: {
              page: 0,
              size: 3,
              sort: 'createdAt',
              order: 'desc'
            }
          })
        ]);

        setBlog(blogResponse.data);
        // Filter out the current blog from related posts
        setRelatedBlogs(relatedResponse.data.blogs.filter(b => b.blogId !== id).slice(0, 3));
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndRelated();
  }, [id]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title;
    let shareUrl;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        message.success('Đã sao chép liên kết vào clipboard');
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Không tìm thấy bài viết</p>
        <Link to="/blog" className="text-blue-600 hover:underline">
          Quay lại trang danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb
            className="mb-6"
            items={[
              {
                title: (
                  <Link to="/">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: <Link to="/blog">Bài viết</Link>,
              },
              {
                title: blog.title,
              },
            ]}
          />

          <Link to="/blog" className="inline-flex items-center text-blue-600 hover:underline mb-6">
            <ArrowLeftOutlined className="mr-1" /> Quay lại danh sách bài viết
          </Link>

          <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Featured Image */}
            {blog.thumbnail && (
              <div className="mb-8 -mx-8 -mt-8">
                <img
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="w-full h-[400px] object-cover rounded-t-lg"
                />
              </div>
            )}

            {/* Title and Meta */}
            <Title level={1} className="text-4xl font-bold mb-4">
              {blog.title}
            </Title>

            <div className="flex items-center text-gray-600 text-sm mb-6">
              <span className="mr-4">
                <span className="font-medium">Đăng bởi:</span>{" "}
                {blog.manager?.fullName || "Quản trị viên"}
              </span>
              <span>
                <span className="font-medium">Ngày đăng:</span>{" "}
                {blog.createdAt}
              </span>
            </div>

            {/* Social Share Buttons */}
            <div className="flex gap-2 mb-8">
              <Button
                icon={<FacebookOutlined />}
                onClick={() => handleShare('facebook')}
                className="text-blue-600 hover:text-blue-700"
              >
                Chia sẻ
              </Button>
              <Button
                icon={<TwitterOutlined />}
                onClick={() => handleShare('twitter')}
                className="text-sky-500 hover:text-sky-600"
              >
                Tweet
              </Button>
              <Button
                icon={<LinkedinOutlined />}
                onClick={() => handleShare('linkedin')}
                className="text-blue-700 hover:text-blue-800"
              >
                LinkedIn
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => handleShare('copy')}
                className="text-gray-600 hover:text-gray-700"
              >
                Sao chép link
              </Button>
            </div>

            {/* Content */}
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>

          {/* Comment Section */}
          <div className="mt-12">
            <Title level={3} className="mb-6">
              Bình luận
            </Title>
            <CommentsSection
              blogId={id}
              currentUser={currentUser}
              onUnauthenticated={() => {
                message.warning('Vui lòng đăng nhập để bình luận');
                navigate('/login', { state: { from: `/blog/${id}` } });
              }}
            />
          </div>
          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-12">
              <Title level={3} className="mb-6">
                Bài viết liên quan
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link to={`/blog/${relatedBlog.blogId}`} key={relatedBlog.blogId}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={relatedBlog.title}
                          src={relatedBlog.thumbnail || "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png"}
                          className="h-48 object-cover"
                        />
                      }
                      className="h-full"
                    >
                      <Card.Meta
                        title={relatedBlog.title}
                        description={
                          <div>
                            <p className="text-gray-500 text-sm mb-2">
                              {relatedBlog.createdAt}
                            </p>
                            <p className="text-gray-600 line-clamp-1">
                              {relatedBlog.content
                                .replace(/<[^>]*>?/gm, '') // Remove HTML tags
                                .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
                                .trim()
                                .split('\n')[0]           // Get first line only
                                .substring(0, 100)        // Limit to 100 characters
                              }{relatedBlog.content.length > 100 ? '...' : ''}
                            </p>
                          </div>
                        }
                      />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
