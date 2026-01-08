import { Carousel } from "antd";

function carousel() {
  return (
    <div className="mt-6">
      <Carousel arrows infinite={true} autoplay>
        <div>
          <div className="min-h-[60vh] flex flex-col justify-center bg-[url('https://images.unsplash.com/photo-1666886573264-38075cc56104?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fGhlYWx0aGNhcmV8ZW58MHx8MHx8fDA%3D')] bg-cover bg-no-repeat bg-center">
            <h1 className="text-left text-3xl font-bold text-white pl-8">
              Nhận thức về Sức khỏe Giới tính
            </h1>
            <h3 className="text-left text-lg font-semibold text-white pl-8">
              Thúc đẩy bình đẳng và tiếp cận chăm sóc sức khỏe cho mọi giới.
            </h3>
          </div>
        </div>
        <div>
          <div className="min-h-[60vh] flex flex-col justify-center bg-[url('https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat bg-center">
            <h1 className="text-left text-3xl font-bold text-white pl-8">
              Giáo dục Toàn diện
            </h1>
            <h3 className="text-left text-lg font-semibold text-white pl-8">
              Trang bị kiến thức về sức khỏe giới tính cho mọi người.
            </h3>
          </div>
        </div>
        <div>
          <div className="min-h-[60vh] flex flex-col justify-center bg-[url('https://plus.unsplash.com/premium_photo-1672760403439-bf51a26c1ae6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat bg-center">
            <h1 className="text-left text-3xl font-bold text-white pl-8">
              Phá vỡ Định kiến
            </h1>
            <h3 className="text-left text-lg font-semibold text-white pl-8">
              Khuyến khích đối thoại cởi mở về giới tính và sức khỏe.
            </h3>
          </div>
        </div>
        <div>
          <div className="min-h-[60vh] flex flex-col justify-center bg-[url('https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-no-repeat bg-center">
            <h1 className="text-left text-3xl font-bold text-white pl-8">
              Xây dựng Tương lai Tốt đẹp hơn
            </h1>
            <h3 className="text-left text-lg font-semibold text-white pl-8">
              Ủng hộ cơ hội bình đẳng và chăm sóc sức khỏe cho tất cả mọi người.
            </h3>
          </div>
        </div>
      </Carousel>
    </div>
  );
}

export default carousel;
