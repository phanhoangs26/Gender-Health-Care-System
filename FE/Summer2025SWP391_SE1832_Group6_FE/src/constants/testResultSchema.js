import * as yup from 'yup';

// Define possible values for enums
const TEST_TYPES = ['NUMERIC']; // Add other types if needed
const GENDER_TYPES = ['MALE', 'FEMALE', 'OTHER'];
const MEASURE_UNITS = [
  'NONE',
  'INTERNATIONAL_UNITS_PER_LITER',
  'MILIMETER_OF_MERCURY',
  'PER_MICROLITER',
  'GRAM_PER_LITER',
  'MICROMOL_PER_LITER',
  'MILIMOL_PER_LITER'
];

// Schema for a single test result
export const testResultSchema = yup.object().shape({
  title: yup.string().required('Vui lòng nhập tên xét nghiệm').min(5, 'Tên xét nghiệm phải có ít nhất 5 ký tự'),
  description: yup.string().required('Vui lòng nhập mô tả').min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  resultType: yup.string().oneOf(TEST_TYPES, 'Loại không hợp lệ').required('Vui lòng chọn loại'),
  genderType: yup.string().oneOf(GENDER_TYPES, 'Giới tính không hợp lệ').required('Vui lòng chọn giới tính'),
  measureUnit: yup.string().oneOf(MEASURE_UNITS, 'Đơn vị đo không hợp lệ').required('Vui lòng chọn đơn vị đo'),
  minValue: yup.number()
    .typeError('Giá trị phải là số')
    .positive('Giá trị phải dương')
    .required('Vui lòng nhập giá trị tối thiểu'),
  maxValue: yup.number()
    .typeError('Giá trị phải là số')
    .positive('Giá trị phải dương')
    .required('Vui lòng nhập giá trị tối đa')
    .min(yup.ref('minValue'), 'Giá trị tối đa phải lớn hơn giá trị tối thiểu'),
  result: yup
    .number()
    .test('is-valid', 'Giá trị không hợp lệ', function(value) {
      const { resultType, minValue, maxValue } = this.parent;
      
      // Skip validation if not numeric type
      if (resultType !== 'NUMERIC') return true;
      
      // Handle empty/undefined
      if (value === '' || value === undefined || value === null) {
        return this.createError({ message: 'Vui lòng nhập kết quả' });
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return this.createError({ message: 'Giá trị phải là số' });
      }
      
      return numValue >= minValue && numValue <= maxValue;
    })
    .required('Vui lòng nhập kết quả'),
});

export const testCompleteFormSchema = yup.object().shape({
  realStartTime: yup.date().required("Vui lòng chọn thời gian bắt đầu thực tế").test(
        'not-before-expected',
        'Thời gian bắt đầu thực tế không được trước thời gian dự kiến',
        function(value) {
          if (!value || !this.parent.expectedStartTime) return true;
          return new Date(value) >= new Date(this.parent.expectedStartTime);
        }
      ),
  realEndTime: yup
    .date()
    .required("Vui lòng chọn thời gian kết thúc thực tế")
    .test("not-before-start", "Thời gian kết thúc phải sau thời gian bắt đầu", function(value) {
      if (!value || !this.parent.realStartTime) return true;
      return new Date(value) >= new Date(this.parent.realStartTime);
    }),
  resultList: yup
    .array()
    .of(testResultSchema)
    .min(1, 'Cần ít nhất một kết quả xét nghiệm')
    .required('Vui lòng thêm ít nhất một kết quả xét nghiệm'),
});