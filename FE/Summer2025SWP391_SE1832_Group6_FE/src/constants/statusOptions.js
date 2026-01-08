export const CONSULTATION_STATUS = [
  { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { value: "RESCHEDULED", label: "Đã thay đổi", color: "orange" },
  { value: "COMPLETED", label: "Đã hoàn thành", color: "green" },
  { value: "CANCELLED", label: "Đã hủy", color: "red" },
];

export const BLOG_STATUS = [
  { value: "ACTIVE", label: "Hoạt động", color: "green" },
  { value: "UNACTIVE", label: "Không hoạt động", color: "red" },
];

export const BOOKING_STATUS = [
  { value: "PENDING", label: "Đang chờ", color: "orange" },
  { value: "CONFIRMED", label: "Đã xác nhận", color: "blue" },
  { value: "COMPLETED", label: "Đã hoàn thành", color: "green" },
  { value: "RESCHEDULED", label: "Đã thay đổi", color: "orange" },
  { value: "CANCELLED", label: "Đã hủy", color: "red" },
];

export const HUMAN_STATUS = [
  { value: "ACTIVE", label: "Đang hoạt động", color: "green" },
  { value: "DELETED", label: "Đã xóa", color: "gray" },
  { value: "SUSPENDED", label: "Đã khóa", color: "orange" },
];

export const CONSULTATION_TYPES = [
  { value: "MENSTRUAL_HEALTH", label: "Sức khỏe kinh nguyệt", gender: "FEMALE" },
  { value: "SEXUAL_HEALTH", label: "Sức khỏe tình dục", gender: "ALL" },
  { value: "UROLOGY", label: "Tiết niệu", gender: "ALL" },
  { value: "GYNECOLOGY", label: "Phụ khoa", gender: "FEMALE" },
  { value: "GENERAL_HEALTH", label: "Sức khỏe tổng quát", gender: "ALL" },
];
