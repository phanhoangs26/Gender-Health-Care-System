import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Space,
  Rate,
  Form,
  Input,
  Button,
} from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import { ratingSchema } from "../../constants/commonSchemas";

const { TextArea } = Input;

const RATING_VALUES = {
  VERY_BAD: 1,
  BAD: 2,
  AVERAGE: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

const RATING_LABELS = {
  1: "Rất tệ",
  2: "Tệ",
  3: "Bình thường",
  4: "Tốt",
  5: "Xuất sắc",
};

const ReviewModal = ({
  isVisible,
  onClose,
  onSubmit,
  initialRating = "GOOD",
  initialComment = "",
}) => {
  const initialValues = {
    rating: initialRating,
    comment: initialComment,
  };

  const getRatingValue = (rating) => {
    return (
      Object.entries(RATING_VALUES).find(([key]) => key === rating)?.[1] || 3
    );
  };

  return (
    <Modal
      title="Đánh giá buổi tư vấn"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      destroyOnHide
    >
      <Formik
        initialValues={initialValues}
        validationSchema={ratingSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error('Error submitting review:', error);
          } finally {
            setSubmitting(false);
          }
        }}
        enableReinitialize
      >
        {({ values, errors, touched, isSubmitting, setFieldValue, handleSubmit }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                name="rating"
                label="Đánh giá của bạn:"
                validateStatus={errors.rating && touched.rating ? "error" : ""}
                help={errors.rating && touched.rating ? errors.rating : ""}
              >
                <div>
                  <Field name="rating">
                    {({ field }) => {
                      const ratingValue = getRatingValue(field.value);
                      return (
                        <Rate
                          {...field}
                          value={ratingValue}
                          onChange={(value) => {
                            const rating =
                              Object.entries(RATING_VALUES).find(
                                ([, val]) => val === value
                              )?.[0] || "GOOD";
                            setFieldValue("rating", rating);
                          }}
                          character={({ index }) =>
                            index < ratingValue ? (
                              <StarFilled style={{ color: "#faad14" }} />
                            ) : (
                              <StarOutlined style={{ color: "#faad14" }} />
                            )
                          }
                        />
                      );
                    }}
                  </Field>
                  <div style={{ marginTop: 8, color: "#faad14" }}>
                    {RATING_LABELS[getRatingValue(values.rating)]}
                  </div>
                </div>
              </Form.Item>

              <Form.Item
                name="comment"
                label="Nhận xét:"
                validateStatus={
                  errors.comment && touched.comment ? "error" : ""
                }
                help={errors.comment && touched.comment ? errors.comment : ""}
              >
                <Field name="comment">
                  {({ field }) => (
                    <TextArea
                      {...field}
                      rows={4}
                      placeholder="Chia sẻ cảm nhận của bạn về buổi tư vấn..."
                    />
                  )}
                </Field>
              </Form.Item>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="default"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="mr-2"
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                >
                  Gửi đánh giá
                </Button>
              </div>
            </Space>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ReviewModal;
