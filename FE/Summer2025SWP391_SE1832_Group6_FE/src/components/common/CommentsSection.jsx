import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Typography,
  Popconfirm,
  Space,
} from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import api from '../../api/axios';
import { fetchPaginatedData } from '../../utils/apiUtils';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const CommentsSection = ({ blogId, currentUser }) => {
  // State for comments and pagination
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [replies, setReplies] = useState({});

  const [replyContents, setReplyContents] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [_showAllComments, _setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    loadingMore: false,
    hasMore: true,
  });

  const processAndSetComments = useCallback((result, page) => {
    if (!result || !result.data) {
      console.error('Invalid comments data:', result);
      return;
    }

    const newComments = Array.isArray(result.data) ? result.data : [];

    setComments((prev) =>
      page === 0 ? newComments : [...prev, ...newComments]
    );

    setPagination((prev) => ({
      ...prev,
      current: page,
      total: result.totalItems || 0,
      loading: false,
      loadingMore: false,
      hasMore: result.totalItems > (page + 1) * (result.pageSize || 10),
    }));
  }, []);

  const fetchReplies = useCallback(async (commentId, page = 0) => {
    try {
      const result = await fetchPaginatedData(
        `/blogs/comments/commentId/${commentId}/subComments`,
        'subComments',
        {
          page: page,
          sort: 'commentId',
          order: 'desc',
        },
        { commentId }
      );

      const processedResult = {
        data: result?.data || [],
        totalItems: result?.totalItems || 0,
        totalPages: result?.totalPages || 1,
        currentPage: result?.currentPage || 0,
      };

      if (result?.status === 404 || !result?.data) {
        console.log('No replies found for comment', commentId);
        setReplies((prev) => ({
          ...prev,
          [commentId]: {
            data: [],
            page: 0,
            totalItems: 0,
            hasMore: false,
            loading: false,
          },
        }));
        return {
          data: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 0,
        };
      }

      setReplies((prev) => ({
        ...prev,
        [commentId]: {
          data:
            page === 0
              ? processedResult.data
              : [...(prev[commentId]?.data || []), ...processedResult.data],
          page: processedResult.currentPage,
          totalItems: processedResult.totalItems,
          hasMore: processedResult.totalItems > (page + 1) * 10,
          loading: false,
        },
      }));

      return processedResult;
    } catch (error) {
      console.error('Error fetching replies:', error);
      if (error.response?.status !== 404) {
        message.info('Hiện tại không có bình luận nào');
      }
      setReplies((prev) => ({
        ...prev,
        [commentId]: {
          data: [],
          page: 0,
          totalItems: 0,
          hasMore: false,
          loading: false,
        },
      }));
      return {
        data: [],
        totalItems: 0,
        totalPages: 1,
        currentPage: 0,
      };
    }
  }, []);

  const fetchComments = useCallback(async (page = 0) => {
    try {
      const result = await fetchPaginatedData(
        `/blogs/comments/blogId/${blogId}`,
        'comments',
        {
          page: page,
          sort: 'createdAt',
          order: 'desc',
        },
        { blogId }
      );

      const processedResult = {
        data: result.data || [],
        totalItems: result.totalItems || 0,
        totalPages: result.totalPages || 0,
        currentPage: result.currentPage || 0,
      };

      const commentIds = processedResult.data.map((comment) => comment.commentId);
      const repliesPromises = commentIds.map((commentId) =>
        fetchReplies(commentId, 0)
      );

      const repliesResults = await Promise.all(repliesPromises);

      const newReplies = {};
      commentIds.forEach((commentId, index) => {
        newReplies[commentId] = {
          data: repliesResults[index]?.data || [],
          loading: false,
          hasMore: repliesResults[index]?.hasMore || false,
          page: repliesResults[index]?.currentPage || 0,
        };
      });

      setReplies((prev) => ({ ...prev, ...newReplies }));

      processAndSetComments(processedResult, page);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  }, [blogId, processAndSetComments, fetchReplies]);

  // Store the fetchComments function in a ref to avoid dependency issues
  const fetchCommentsRef = useRef(fetchComments);
  useEffect(() => {
    fetchCommentsRef.current = fetchComments;
  }, [fetchComments]);

  const initialLoadRef = useRef(false);

  const loadMoreComments = useCallback(async (page = 0) => {
    if (!currentUser?.id) {
      console.log('Not authenticated, skipping comment load');
      return;
    }

    if (pagination.loading || pagination.loadingMore || (page > 0 && !pagination.hasMore)) {
      return;
    }

    try {
      setPagination(prev => ({
        ...prev,
        loading: page === 0,
        loadingMore: page > 0,
      }));

      const result = await fetchPaginatedData(
        `/blogs/comments/blogId/${blogId}`,
        'comments',
        { page, sort: 'createdAt', order: 'desc' },
        { blogId }
      );

      processAndSetComments(result, page);
    } catch (error) {
      console.error('Error loading more comments:', error);
      setPagination(prev => ({
        ...prev,
        loading: false,
        loadingMore: false,
      }));
    }
  }, [blogId, currentUser?.id, pagination, processAndSetComments]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      loadMoreComments(0);
      initialLoadRef.current = true;
    }
  }, [loadMoreComments]);

  const handleSubmit = useCallback(async () => {
    const content = commentContent.trim();
    try {
      setPagination(prev => ({ ...prev, loading: true }));
      const response = await api.post(
        `/blogs/comments/blogId/${blogId}/create?accountId=${currentUser?.id}&content=${encodeURIComponent(content)}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data) {
        message.success('Bình luận đã được đăng');
        setCommentContent('');
        fetchCommentsRef.current(0);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng bình luận';
      message.error(errorMessage);
    } finally {
      setPagination(prev => ({ ...prev, loading: false }));
    }
  }, [blogId, commentContent, currentUser?.id]);

  const loadMoreReplies = useCallback(
    async (commentId) => {
      if (!commentId) return;

      try {
        setReplies((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            loading: true,
          },
        }));

        const currentPage = replies[commentId]?.page || 0;
        await fetchReplies(commentId, currentPage + 1);
      } catch (error) {
        console.error('Error loading more replies:', error);
        message.error('Không thể tải thêm phản hồi');
      } finally {
        setReplies((prev) => ({
          ...prev,
          [commentId]: {
            ...prev[commentId],
            loading: false,
          },
        }));
      }
    },
    [replies, fetchReplies]
  );

  const handleReply = async (content, commentId) => {
    if (!commentId) {
      message.error('Không tìm thấy bình luận để phản hồi');
      return;
    }

    try {
      setPagination((prev) => ({ ...prev, loading: true }));

      await api.post(
        `/blogs/comments/commentId/${commentId}/create-subComment?blogId=${blogId}&accountId=${currentUser?.id}&content=${content}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      message.success('Phản hồi đã được đăng');
      setReplyingToId(null);
      await fetchReplies(commentId, 0);
    } catch (error) {
      console.error('Error replying to comment:', error);
      message.error('Có lỗi khi gửi phản hồi');
    } finally {
      setPagination((prev) => ({ ...prev, loading: false }));
    }
  };



  const handleReplyContentChange = (commentId, content) => {
    setReplyContents((prev) => ({
      ...prev,
      [commentId]: content,
    }));
  };

  const toggleReply = useCallback((comment) => {
    setReplyingToId(prevId => {
      // If clicking reply on the same comment, close it
      if (prevId === comment.commentId) {
        return null;
      }
      // Otherwise, set the new comment ID
      return comment.commentId;
    });
  }, []);

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.put(`/blogs/comments/commentId/${commentId}/remove`);
      message.success('Đã xóa bình luận thành công');
      loadMoreComments(0);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId, currentContent) => {
    try {
      setEditingCommentId(commentId);
      setEditContent(currentContent);
    } catch (error) {
      console.error('Error preparing to edit comment:', error);
    }
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await api.post(`/blogs/comments/commentId/${commentId}/edit?accountId=${currentUser?.id}&newContent=${editContent}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      message.success('Bình luận đã được cập nhật');
      setEditingCommentId(null);
      setEditContent('');
      loadMoreComments(0);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const renderComment = (comment, level = 0) => {
    // Only destructure what's actually used in the component
    const { commentId, accountId: commentAuthorId } = comment;
    const isReply = level > 0;
    const commentReplies = replies[commentId]?.data || [];
    const hasReplies = commentReplies.length > 0;
    const showReplyReplies = showReplies[commentId] || false;
    const replyContent = replyContents[commentId] || '';
    const isCurrentUserComment = currentUser?.id === commentAuthorId;

    return (
      <div
        key={comment.commentId}
        className={`${level > 0 ? 'ml-10 mt-4' : ''}`}
      >
        <Card size="small" className="mb-4 p-2">
          <div className="flex gap-3">
            <div>
              <Avatar
                icon={<UserOutlined />}
                src={comment?.authorAvatar}
                alt={comment.username}
              >
                {!comment?.authorAvatar && comment?.username.charAt(0).toUpperCase()}
              </Avatar>
            </div>
            <div className="flex-1">
              {comment.status === 'REMOVED' ? (
                <Text type="danger">Bình luận đã bị xóa</Text>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Text strong className="mr-2">
                        {comment.username || 'Người dùng ẩn danh'}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {dayjs(comment.createdAt, 'DD/MM/YYYY HH:mm').format(
                          'DD/MM/YYYY HH:mm'
                        )}
                      </Text>
                    </div>
                    {isCurrentUserComment && (
                      <Space size="small">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditComment(comment.commentId, comment.content)}
                        />
                        {currentUser?.role === 'MANAGER' && comment.status !== 'REMOVED' && (
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa bình luận này?"
                        onConfirm={() => handleDeleteComment(comment.commentId)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true, size: 'middle' }}
                        cancelButtonProps={{ size: 'middle' }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteComment(comment.commentId)}
                        />
                      </Popconfirm>
                    )}
                      </Space>
                    )}
                  </div>
                  <div className="mb-2">
                    {editingCommentId === comment.commentId ? (
                      <div className="flex flex-col gap-2">
                        <Input.TextArea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          autoSize={{ minRows: 2, maxRows: 6 }}
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="small" onClick={handleCancelEdit}>
                            Hủy
                          </Button>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSaveEdit(comment.commentId)}
                            loading={pagination.loading}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Text>{comment.edited_Content || comment.content}</Text>
                        {comment.editedAt && (
                          <Text type="secondary" className="text-xs block mt-1">
                            (Đã chỉnh sửa: {comment.editedAt})
                          </Text>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-4">
                    {currentUser?.role === 'MANAGER' && comment.status !== 'REMOVED' && (
                      <Popconfirm
                        title="Bạn có chắc chắn muốn xóa bình luận này?"
                        onConfirm={() => handleDeleteComment(comment.commentId)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true, size: 'middle' }}
                        cancelButtonProps={{ size: 'middle' }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                        >
                          Xóa
                        </Button>
                      </Popconfirm>
                    )}
                    {currentUser?.role !== 'MANAGER' && comment.status !== 'REMOVED' && !isReply && currentUser?.id && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CommentOutlined />}
                        onClick={() => toggleReply(comment)}
                        className="p-0 h-auto"
                      >
                        {replyingToId === comment.commentId ? 'Hủy' : 'Trả lời'}
                      </Button>
                    )}
                    {hasReplies && (
                      <Button
                        type="text"
                        size="small"
                        onClick={() => toggleReplies(comment.commentId)}
                        className="p-0 h-auto"
                      >
                        {showReplyReplies
                          ? 'Ẩn phản hồi'
                          : `Xem phản hồi (${commentReplies.length})`}
                      </Button>
                    )}
                  </div>

                  {replyingToId === comment.commentId && !isReply && (
                    <div className="mt-3">
                      <TextArea
                        value={replyContent}
                        onChange={(e) => handleReplyContentChange(comment.commentId, e.target.value)}
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung phản hồi' },
                          { min: 5, message: 'Phản hồi phải có ít nhất 5 ký tự' }
                        ]}
                      />
                      <div className="mt-2 text-right">
                        <Button onClick={() => toggleReply(comment)} className="mr-2">
                          Hủy
                        </Button>
                        <Button
                          onClick={async () => {
                            const content = replyContent.trim();
                            if (!content) {
                              message.warning('Vui lòng nhập nội dung phản hồi');
                              return;
                            }
                            if (content.length < 5) {
                              message.warning('Phản hồi phải có ít nhất 5 ký tự');
                              return;
                            }
                            try {
                              await handleReply(replyContent, comment.commentId);
                              setReplyContents((prev) => ({
                                ...prev,
                                [comment.commentId]: '',
                              }));
                            } catch (error) {
                              console.error('Error submitting reply:', error);
                            }
                          }}
                          type="primary"
                          loading={pagination.loading}
                        >
                          Gửi
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        {showReplyReplies && hasReplies && (
          <div className="ml-4">
            {commentReplies.map((reply) => renderComment(reply, level + 1))}
            {replies[comment.commentId]?.hasMore && (
              <div className="text-center mt-2">
                <Button
                  type="link"
                  size="small"
                  onClick={() => loadMoreReplies(comment.commentId)}
                  loading={replies[comment.commentId]?.loading}
                >
                  Xem thêm phản hồi
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Memoize the comment form to prevent unnecessary re-renders
  const commentForm = useMemo(() => {
    // Don't show comment form for MANAGER role
    if (currentUser?.role === 'MANAGER') {
      return null;
    }
    
    return (
      <Card className="mb-6">
        <div className="flex gap-3">
          <div>
            <Avatar
              icon={<UserOutlined />}
              src={currentUser?.avatar}
              alt={currentUser?.fullName}
            >
              {currentUser?.fullName?.charAt(0).toUpperCase()}
            </Avatar>
          </div>
          <div className="flex-1">
            <Form onFinish={handleSubmit}>
              <Form.Item
                name="content"
                rules={[
                  { required: true, message: 'Vui lòng nhập nội dung bình luận' },
                  { min: 1, message: 'Nội dung bình luận không được để trống' },
                  { max: 1000, message: 'Nội dung bình luận không được vượt quá 1000 ký tự' },
                ]}
                className="mb-3"
              >
                <TextArea
                  rows={4}
                  placeholder={currentUser ? "Viết bình luận..." : "Vui lòng đăng nhập để bình luận"}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={!currentUser}
                />
              </Form.Item>
              <Form.Item className="mb-0">
                <Button 
                  htmlType="submit" 
                  type="primary" 
                  loading={pagination.loading}
                  disabled={!currentUser}
                  onClick={!currentUser ? () => message.warning('Vui lòng đăng nhập để bình luận') : undefined}
                >
                  {currentUser ? 'Bình luận' : 'Đăng nhập để bình luận'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    );
  }, [currentUser, commentContent, pagination.loading, handleSubmit]);

  // Memoize the load more button
  const loadMoreButton = useMemo(() => {
    if (!pagination.hasMore || _showAllComments || comments.length <= 5) return null;
    
    return (
      <div className="text-center mt-4">
        <Button onClick={() => _setShowAllComments(true)} type="link">
          Xem thêm {comments.length - 5} bình luận
        </Button>
      </div>
    );
  }, [pagination.hasMore, _showAllComments, comments.length]);

  return (
    <div className="comments-section">
      {commentForm}
      <div className="comments-list">
        {(_showAllComments ? comments : comments.slice(0, 5)).map((comment) => (
          <div key={comment.commentId} className="mb-4">
            {renderComment(comment, 0)}
          </div>
        ))}
      </div>
      {loadMoreButton}
    </div>
  );
};

export default CommentsSection;
