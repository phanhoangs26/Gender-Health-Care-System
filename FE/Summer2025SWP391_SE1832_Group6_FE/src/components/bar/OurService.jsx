import { Card, Button } from "antd";
import { CheckCircleOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Tư vấn chuyên sâu",
    icon: "💡",
    description: "Đội ngũ chuyên gia giàu kinh nghiệm tư vấn và hỗ trợ bạn mọi lúc mọi nơi",
    features: [
      "Tư vấn 1-1 với chuyên gia",
      "Đặt lịch hẹn linh hoạt",
      "Theo dõi tiến độ"
    ]
  },
  {
    id: 3,
    title: "Chăm sóc sức khỏe",
    icon: "❤️",
    description: "Giải pháp chăm sóc sức khỏe toàn diện cho cá nhân và gia đình",
    features: [
      "Theo dõi sức khỏe định kỳ",
      "Tư vấn dinh dưỡng",
      "Hỗ trợ 24/7"
    ]
  }
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Dịch vụ của chúng tôi</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cung cấp các giải pháp chăm sóc sức khỏe toàn diện, tiện lợi và chất lượng cao
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card
              key={service.id}
              className="h-full flex flex-col rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-0"
              hoverable
            >
              <div className="text-5xl mb-4 text-center">{service.icon}</div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center mb-6">{service.description}</p>
              <ul className="space-y-3 mb-6 flex-grow">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleOutlined className="text-green-500 mt-1 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                type="primary" 
                as={Link}
                to="/consultant-booking"
                block 
                size="large"
                className="bg-green-600 hover:bg-green-700 border-0 font-medium"
              >
                Tìm hiểu thêm
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
