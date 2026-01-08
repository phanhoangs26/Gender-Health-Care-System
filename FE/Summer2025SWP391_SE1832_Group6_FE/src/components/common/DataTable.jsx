// Components/common/DataTable.jsx
import { Table, Space, Button, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';

export const ActionButtons = ({ onView, onEdit, onDelete, onComplete, viewLabel = "Xem chi tiết", editLabel = "Cập nhật", deleteLabel = "Xóa", completeLabel = "Hoàn thành"}) => (
  <Space size="middle">
    {onView && <Button type="link" className="text-gray-600 hover:text-gray-700" onClick={onView} icon={<EyeOutlined />}>{viewLabel}</Button>}
    {onEdit && <Button type="link" className="text-blue-600 hover:text-blue-700" onClick={onEdit} icon={<EditOutlined />}>{editLabel}</Button>}
    {onComplete && <Button type="link" className="text-green-600 hover:text-green-700" onClick={onComplete} icon={<CheckOutlined />}>{completeLabel}</Button>}
    {onDelete && <Button danger type="link" className="text-red-600 hover:text-red-700" onClick={onDelete} icon={<DeleteOutlined />}>{deleteLabel}</Button>}
  </Space>
);

export const StatusTag = ({ status, options }) => {
  const statusObj = options.find(opt => opt.value === status);
  return <Tag color={statusObj?.color}>{statusObj?.label || status}</Tag>;
};
