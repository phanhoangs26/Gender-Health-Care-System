import * as yup from "yup";
import moment from "moment";

// Common field validations that can be reused
export const commonFieldValidations = {
  username: yup
    .string()
    .required("Vui lòng nhập tên tài khoản")
    .min(5, "Tên tài khoản phải có ít nhất 5 ký tự")
    .max(20, "Tên tài khoản không được vượt quá 20 ký tự")
    .trim()
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),

  password: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(3, "Mật khẩu phải có ít nhất 3 ký tự")
    .trim(),
  // .matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  //   "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
  // ),

  email: yup
    .string()
    .email("Địa chỉ email không hợp lệ")
    .required("Vui lòng nhập địa chỉ email")
    .trim(),

  phone: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^(0|\+84)[1-9][0-9]{8,9}$/, "Số điện thoại không hợp lệ")
    .trim(),

  fullName: yup
    .string()
    .required("Vui lòng nhập họ và tên")
    .min(5, "Họ và tên phải có ít nhất 5 ký tự")
    .max(50, "Họ và tên không được vượt quá 50 ký tự")
    .trim(),

  address: yup
    .string()
    .required("Vui lòng nhập địa chỉ")
    .min(5, "Địa chỉ quá ngắn")
    .max(255, "Địa chỉ quá dài")
    .trim(),

  gender: yup.string().required("Vui lòng chọn giới tính"),

  dateOfBirth: yup
    .date()
    .required("Vui lòng chọn ngày sinh")
    .max(new Date(), "Ngày sinh không hợp lệ")
    .test("age", "Bạn phải đủ 18 tuổi trở lên!", function (value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }),

  role: yup.string().required("Vui lòng chọn vai trò"),

  status: yup.string().required("Vui lòng chọn trạng thái"),

  title: yup
    .string()
    .required("Vui lòng nhập tiêu đề bài viết")
    .min(5, "Tiêu đề phải có ít nhất 5 ký tự")
    .max(255, "Tiêu đề không được vượt quá 255 ký tự")
    .trim(),
  content: yup
    .string()
    .required("Vui lòng nhập nội dung bài viết")
    .min(10, "Nội dung phải có ít nhất 10 ký tự")
    .trim(),

  expectedStartTime: yup.date().required("Vui lòng chọn thời gian bắt đầu"),

  realStartTime: yup.date().required("Vui lòng chọn thời gian bắt đầu thực tế"),
  // .test(
  //   "after-expected-start",
  //   "Thời gian bắt đầu thực tế phải sau thời gian bắt đầu dự kiến",
  //   function (value) {
  //     if (!value || !this.parent.expectedStartTime) return true;
  //     return new Date(value) > new Date(this.parent.expectedStartTime);
  //   }
  // )
  // .test(
  //   "before-expected-end",
  //   "Thời gian bắt đầu thực tế phải trước thời gian kết thúc dự kiến",
  //   function (value) {
  //     if (!value || !this.parent.expectedEndTime) return true;
  //     return new Date(value) < new Date(this.parent.expectedEndTime);
  //   }
  // )
  // .max(
  //   yup.ref("realEndTime"),
  //   "Thời gian bắt đầu phải trước thời gian kết thúc"
  // ),
  realEndTime: yup.date().required("Vui lòng chọn thời gian kết thúc thực tế"),
  // .min(
  //   yup.ref("realStartTime"),
  //   "Thời gian kết thúc phải sau thời gian bắt đầu"
  // )
  // .test(
  //   "before-expected",
  //   "Thời gian kết thúc phải trước thời gian kết thúc dự kiến",
  //   function (value) {
  //     if (!value || !this.parent.expectedEndTime) return true;
  //     return new Date(value) <= new Date(this.parent.expectedEndTime);
  //   }
  // ).test(
  //   "not-same-as-start",
  //   "Thời gian kết thúc phải khác thời gian bắt đầu",
  //   function (value) {
  //     if (!value || !this.parent.realStartTime) return true;
  //     return new Date(value).getTime() !== new Date(this.parent.realStartTime).getTime();
  //   }
  // ),

  certificateName: yup.string().required("Vui lòng nhập tên chứng chỉ"),

  issuedBy: yup.string().required("Vui lòng nhập nơi cấp"),

  issueDate: yup
    .date()
    .required("Vui lòng chọn ngày cấp")
    .test(
      "issue-date-before-today",
      "Ngày cấp phải trước ngày hiện tại",
      function (value) {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value < today;
      }
    ),

  expiryDate: yup
    .date()
    .required("Vui lòng chọn ngày hết hạn")
    .test(
      "expiry-after-today",
      "Ngày hết hạn phải sau ngày hiện tại ít nhất 1.5 năm",
      function (value) {
        if (!value) return true;
        const minExpiryDate = new Date();
        minExpiryDate.setFullYear(minExpiryDate.getFullYear() + 1);
        minExpiryDate.setMonth(minExpiryDate.getMonth() + 6);
        minExpiryDate.setHours(0, 0, 0, 0);
        return value >= minExpiryDate;
      }
    )
    .test(
      "expiry-after-issue",
      "Ngày hết hạn phải sau ngày cấp ít nhất 2 năm",
      function (value) {
        if (!value || !this.parent.issueDate) return true;
        const minExpiryDate = new Date(this.parent.issueDate);
        minExpiryDate.setFullYear(minExpiryDate.getFullYear() + 2);
        minExpiryDate.setHours(0, 0, 0, 0);
        return value >= minExpiryDate;
      }
    ),

  description: yup.string().required("Vui lòng nhập mô tả"),

  certificateImage: yup.string().required("Vui lòng tải lên ảnh chứng chỉ"),

  rating: yup.string().required("Vui lòng chọn đánh giá"),
  comment: yup
    .string()
    .required("Vui lòng nhập nhận xét")
    .min(5, "Nhận xét phải có ít nhất 5 ký tự")
    .max(255, "Nhận xét không được vượt quá 255 ký tự"),

  hasMenstrualCycle: yup.boolean().required("Vui lòng chọn có hoặc không"),
  cycleLengthDays: yup
    .number()
    .required("Vui lòng nhập số ngày trong chu kỳ")
    .min(28, "Số ngày trong chu kỳ phải ít nhất 28 ngày")
    .max(365, "Số ngày trong chu kỳ phải ít nhất 365 ngày")
    .integer("Số ngày trong chu kỳ phải là số nguyên")
    .positive("Số ngày trong chu kỳ phải là số dương"),
  notes: yup
    .string()
    .min(5, "Ghi chú phải có ít nhất 5 ký tự")
    .max(255, "Ghi chú không được vượt quá 255 ký tự"),
  lastCycleStart: yup
    .date()
    .required("Vui lòng chọn ngày bắt đầu chu kỳ")
    .max(new Date(), "Ngày bắt đầu chu kỳ phải trước ngày hiện tại")
    .test(
      "last-cycle-start-before-today",
      "Ngày bắt đầu chu kỳ phải trước ngày hiện tại",
      function (value) {
        if (!value) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return value < today;
      }
    ),
};

// Common schemas that can be composed together
export const userSchema = yup.object().shape({
  username: commonFieldValidations.username,
  password: commonFieldValidations.password,
  email: commonFieldValidations.email,
  phone: commonFieldValidations.phone,
  fullName: commonFieldValidations.fullName,
  address: commonFieldValidations.address,
  gender: commonFieldValidations.gender,
  dateOfBirth: commonFieldValidations.dateOfBirth,
});

// User profile
export const userProfileSchema = yup.object().shape({
  fullName: commonFieldValidations.fullName,
  phone: commonFieldValidations.phone,
  email: commonFieldValidations.email,
  address: commonFieldValidations.address,
  dateOfBirth: commonFieldValidations.dateOfBirth,
  password: yup.string().optional(),
});

// Schema for login
export const loginSchema = yup.object().shape({
  role: commonFieldValidations.role,
  username: commonFieldValidations.username,
  password: commonFieldValidations.password,
});

// Schema for registration
export const registerSchema = yup.object().shape({
  ...userSchema.fields,
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password"), null], "Mật khẩu không khớp")
    .trim(),
});

// Schema for update user
export const updateSchema = yup.object().shape({
  fullName: commonFieldValidations.fullName,
  phone: commonFieldValidations.phone,
  email: commonFieldValidations.email,
  address: commonFieldValidations.address,
  status: commonFieldValidations.status,
});

export const statusSchema = yup.object().shape({
  status: commonFieldValidations.status,
});

export const ratingSchema = yup.object().shape({
  rating: commonFieldValidations.rating,
  comment: commonFieldValidations.comment,
});
// Validation schema
export const consultantProfileSchema = yup.object().shape({
  fullName: commonFieldValidations.fullName,
  phone: commonFieldValidations.phone,
  email: commonFieldValidations.email,
  address: commonFieldValidations.address,
});

// Schema for staff
export const staffSchema = yup.object().shape({
  username: commonFieldValidations.username,
  fullName: commonFieldValidations.fullName,
  password: commonFieldValidations.password,
  phone: commonFieldValidations.phone,
  email: commonFieldValidations.email,
  address: commonFieldValidations.address,
});

// Blog validation schemas
export const blogSchema = yup.object().shape({
  title: commonFieldValidations.title,
  content: commonFieldValidations.content,
});

export const updateBlogSchema = yup.object().shape({
  title: commonFieldValidations.title,
  content: commonFieldValidations.content,
  status: commonFieldValidations.status,
});

// Manager validation schemas
export const managerSchema = yup.object().shape({
  ...staffSchema.fields,
  status: commonFieldValidations.status,
});

// Schedule time update schema

export const timeUpdateSchema = yup.object().shape({
  expectedStartTime: commonFieldValidations.expectedStartTime,
});

// Helper function to parse date string to Date object
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (dateStr && dateStr.$d) return dateStr.$d; // Handle dayjs objects
  
  // Handle DD/MM/YYYY HH:mm format
  if (typeof dateStr === 'string' && dateStr.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)) {
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes);
  }
  
  // Fallback to default Date parsing
  return new Date(dateStr);
};

export const completeFormSchema = yup.object().shape({
  realStartTime: yup
    .string()
    .required('Vui lòng nhập thời gian bắt đầu')
    .matches(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
      'Định dạng thời gian phải là DD/MM/YYYY HH:mm'
    )
    .test(
      'not-before-expected',
      'Thời gian bắt đầu thực tế không được trước thời gian dự kiến',
      function(value) {
        if (!value || !this.parent.expectedStartTime) return true;
        
        const valueDate = parseDateString(value);
        const expectedDate = parseDateString(this.parent.expectedStartTime);
        
        if (!valueDate || !expectedDate) return true;
        
        return valueDate >= expectedDate;
      }
    ),
    
  realEndTime: yup
    .string()
    .required('Vui lòng nhập thời gian kết thúc')
    .matches(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
      'Định dạng thời gian phải là DD/MM/YYYY HH:mm'
    )
    .test(
      'min-duration',
      'Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 20 phút',
      function(value) {
        if (!value || !this.parent.realStartTime) return true;
        
        const startTime = parseDateString(this.parent.realStartTime);
        const endTime = parseDateString(value);
        
        if (!startTime || !endTime) return true;
        
        const diffMinutes = (endTime - startTime) / (1000 * 60);
        return diffMinutes >= 20;
      }
    )
    .test(
      'max-duration',
      'Thời gian kết thúc không được quá 60 phút so với thời gian bắt đầu',
      function(value) {
        if (!value || !this.parent.realStartTime) return true;
        
        const startTime = parseDateString(this.parent.realStartTime);
        const endTime = parseDateString(value);
        
        if (!startTime || !endTime) return true;
        
        const diffMinutes = (endTime - startTime) / (1000 * 60);
        return diffMinutes <= 60;
      }
    ),
    description: yup.string().required('Vui lòng nhập mô tả').min(5, 'Mô tả phải có ít nhất 5 ký tự').max(255, 'Mô tả không được vượt quá 255 ký tự'),
});

// Helper function to check if time is within business hours (9:00 - 18:00)
const isWithinBusinessHours = (time) => {
  if (!time) return true;
  const hour = time.hour();
  return hour >= 6 && hour < 18; // 9:00 AM to 5:59 PM
};

// Helper function to validate time slot format (HH:00 or HH:30)
const isValidTimeSlot = (time) => {
  if (!time) return true;
  // If time is a string in HH:mm format
  if (typeof time === 'string') {
    const [_, minutes] = time.split(':').map(Number);
    return minutes === 0;
  }
  // If time is a moment object (for backward compatibility)
  if (time && typeof time.minute === 'function') {
    return time.minute() === 0;
  }
  return false;
};


// Booking schema
export const bookingSchema = yup.object().shape({
  date: yup
    .date()
    .required("Vui lòng chọn ngày")
    .min(moment().startOf("day"), "Không thể chọn ngày trong quá khứ"),
  time: yup
    .mixed()
    .required("Vui lòng chọn giờ hẹn")
    .test(
      "is-future-time",
      "Giờ hẹn không được trong quá khứ",
      function (value) {
        const { date } = this.parent;
        if (!date || !value) return true;

        const selectedDateTime = moment(date).set({
          hour: value.hour(),
          minute: value.minute(),
          second: 0,
          millisecond: 0,
        });

        return selectedDateTime.isSameOrAfter(moment(), "minute");
      }
    )
    .test(
      "is-business-hours",
      "Thời gian làm việc từ 9:00 đến 18:00",
      (value) => isWithinBusinessHours(value)
    )
    .test(
      "is-valid-time-slot",
      "Vui lòng chọn giờ bắt đầu vào giờ đúng (ví dụ: 9:00)",
      (value) => isValidTimeSlot(value)
    ),
  consultationType: yup.string().required("Vui lòng chọn loại tư vấn"),
  accountId: yup.string().required("Vui lòng chọn người tư vấn"),
});

export const testBookingSchema = yup.object().shape({
  serviceId: yup.string().required("Vui lòng chọn dịch vụ"),
  date: yup
    .date()
    .required("Vui lòng chọn ngày")
    .min(moment().startOf("day"), "Không thể chọn ngày trong quá khứ"),
  time: yup
    .string()
    .required("Vui lòng chọn giờ hẹn")
    .test(
      "is-valid-time",
      "Vui lòng chọn thời gian hợp lệ",
      function (value) {
        if (!value) return false;
        // Check if the time is in HH:mm format
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      }
    )
    .test(
      "is-future-time",
      "Giờ hẹn không được trong quá khứ",
      function (value) {
        const { date } = this.parent;
        if (!date || !value) return true;
        
        // Parse the time string (HH:mm)
        const [hours, minutes] = value.split(':').map(Number);
        
        // Create a moment object with the selected date and time
        const selectedDateTime = moment(date)
          .set({
            hour: hours,
            minute: minutes,
            second: 0,
            millisecond: 0
          });
          
        return selectedDateTime.isSameOrAfter(moment(), "minute");
      }
    )
    .test(
      "is-business-hours",
      "Thời gian làm việc từ 9:00 đến 18:00",
      function (value) {
        if (!value) return false;
        const [hours] = value.split(':').map(Number);
        return hours >= 9 && hours < 18; // 9:00 to 17:59
      }
    )
    .test(
      "is-valid-time-slot",
      "Vui lòng chọn giờ bắt đầu vào giờ đúng (ví dụ: 9:00)",
      (value) => isValidTimeSlot(value)
    )
});

// Consultant schema
export const certificateSchema = yup.object().shape({
  certificateName: commonFieldValidations.certificateName,
  issuedBy: commonFieldValidations.issuedBy,
  issueDate: commonFieldValidations.issueDate,
  expiryDate: commonFieldValidations.expiryDate,
  description: commonFieldValidations.description,
  certificateImage: commonFieldValidations.certificateImage,
});
