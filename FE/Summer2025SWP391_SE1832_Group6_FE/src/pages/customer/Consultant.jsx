// Consultant.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Avatar,
  Modal,
  Spin,
  Image,
  message
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { Loading, NotAuthenticated } from "../../components/common/Loading";
const { Title, Paragraph } = Typography;

export default function Consultant() {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);
  const { user, authLoading, isAuthenticated } = useContext(AuthContext);
  const [isCertificatesModalVisible, setIsCertificatesModalVisible] =
    useState(false);
  const [certificates, setCertificates] = useState([]);
  const [isCertificatesLoading, setIsCertificatesLoading] = useState(false);

  const showCertificatesModal = async (id) => {
    setIsCertificatesLoading(true);
    try {
      const response = await api.get(
        `/customer/consultant-list/certificates/${id}`
      );
      setCertificates(response.data || []);
      setIsCertificatesModalVisible(true);
    } catch (error) {
      if (error.response?.status === 404) {
        // If no certificates found, show an empty array and display a message
        setCertificates([]);
        message.info("Tư vấn viên này chưa có chứng chỉ nào");
      } else {
        console.error("Error fetching certificates:", error);
        message.error("Không thể tải thông tin chứng chỉ");
      }
    } finally {
      setIsCertificatesLoading(false);
    }
  };

  const handleCertificatesModalClose = () => {
    setIsCertificatesModalVisible(false);
    setCertificates([]);
  };

  const fetchConsultant = useCallback(async () => {
    if (!user) {
      console.log("User not available, skipping fetch");
      return { data: [] };
    }
    try {
      const response = await api.get("/customer/consultant-list/");
      setConsultants(response.data || []);
    } catch (error) {
      console.error("Error fetching consultants:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchConsultant();
  }, [fetchConsultant]);

  const handleBookAppointment = () => {
    navigate(`/consultant-booking`);
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <NotAuthenticated />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header Section */}
      <div className="container mx-auto px-4 mb-12 text-center">
        <Title level={1} className="text-4xl font-bold text-green-600 mb-4">
          Đội ngũ Chuyên gia Tư vấn
        </Title>
        <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto">
          Kết nối với các chuyên gia y tế giàu kinh nghiệm của chúng tôi để nhận
          được sự tư vấn và hỗ trợ chuyên nghiệp nhất.
        </Paragraph>
      </div>

      {/* Certificates Modal */}
      <Modal
        title="Chứng chỉ tư vấn viên"
        open={isCertificatesModalVisible}
        onCancel={handleCertificatesModalClose}
        footer={null}
        width={800}
      >
        {isCertificatesLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          </div>
        ) : certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <Image
                  src={cert.certificateUrl}
                  alt={`Chứng chỉ ${index + 1}`}
                  className="w-full h-auto"
                  preview={{
                    src: cert.certificateUrl,
                  }}
                />
                <div className="p-2 bg-gray-50">
                  <p className="font-medium">{cert.certificateName}</p>
                  {cert.issuedDate && (
                    <p className="text-sm text-gray-500">
                      Cấp ngày: {new Date(cert.issuedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có chứng chỉ nào được tìm thấy
          </div>
        )}
      </Modal>

      {/* Consultants List */}
      <div className="container mx-auto px-4">
        <Row gutter={[24, 24]}>
          {consultants.map((consultant) => (
            <Col xs={24} md={12} lg={8} key={consultant.accountId}>
              <Card
                className="h-full flex flex-col"
                hoverable
                cover={
                  <div className="p-6 text-center">
                    <Avatar
                      size={120}
                      src={consultant.avatarUrl}
                      icon={<UserOutlined />}
                      className="mx-auto mb-4"
                    />
                    <Title level={3} className="mb-1">
                      {consultant.fullName}
                    </Title>
                  </div>
                }
              >
                <div className="mb-4">
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <MailOutlined className="mr-2" />
                      <a
                        href={`mailto:${consultant.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {consultant.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2" />
                      <a
                        href={`tel:${consultant.phone.replace(/\s+/g, "")}`}
                        className="text-blue-500 hover:underline"
                      >
                        {consultant.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 px-4">
                  <Button
                    type="primary"
                    block
                    size="large"
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                    onClick={handleBookAppointment}
                  >
                    Đặt lịch tư vấn
                  </Button>
                  <Button
                    type="primary"
                    block
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                    onClick={() =>
                      showCertificatesModal(consultant.accountId)
                    }
                  >
                    Xem thông tin chứng chỉ
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
