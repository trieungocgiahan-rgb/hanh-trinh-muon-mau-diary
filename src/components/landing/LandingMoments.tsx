import iconPhotos from "@/assets/landing-icon-photos.png";
import iconJournal from "@/assets/landing-icon-journal.png";
import iconUpdates from "@/assets/landing-icon-updates.png";
import desk from "@/assets/landing-desk.jpg";

const cards = [
  {
    icon: iconPhotos,
    title: "Ảnh & khoảnh khắc",
    body: "Bộ ảnh của từng buổi, ai cũng góp được và luôn ghi rõ người đăng.",
  },
  {
    icon: iconJournal,
    title: "Trang nhật ký",
    body: "Cảm nhận, điều học được, điều cần cải thiện — viết ngắn thôi cũng đủ.",
  },
  {
    icon: iconUpdates,
    title: "Cập nhật dự án",
    body: "Cột mốc, số người tham gia, kết quả sau mỗi hoạt động, gọn trong một dòng.",
  },
];

export function LandingMoments() {
  return (
    <section id="khoanh-khac" className="scroll-mt-20 bg-gradient-blush py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-hand text-2xl text-primary">Sổ tay của cả đội</p>
          <h2 className="mt-2 font-display text-3xl leading-tight font-extrabold text-foreground sm:text-4xl">
            Tìm theo khoảnh khắc, không chỉ theo ngày
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Xem theo lịch tháng, theo loại hoạt động, hay chỉ đơn giản là lần lượt lật lại từng
            trang.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="surface surface-lift rounded-xl p-6 text-center">
              <img
                src={c.icon}
                alt=""
                width={816}
                height={816}
                loading="lazy"
                className="mx-auto h-24 w-24 object-contain"
              />
              <h3 className="mt-3 font-display text-xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="surface mt-14 overflow-hidden rounded-xl shadow-pop sm:flex">
          <img
            src={desk}
            alt="Bàn làm việc với ảnh in, sổ tay và giấy ghi chú"
            width={1008}
            height={1008}
            loading="lazy"
            className="h-56 w-full object-cover sm:h-80 sm:w-1/2"
          />
          <div className="flex flex-col justify-center gap-3 p-8 sm:h-80 sm:w-1/2">
            <p className="font-hand text-2xl text-primary">Mỗi trang là một ngày</p>
            <h3 className="font-display text-2xl font-extrabold text-foreground">
              Viết nhanh, nhớ lâu
            </h3>
            <p className="text-sm text-muted-foreground">
              Ghi âm một đoạn cảm xúc, kéo ảnh vào, chọn loại hoạt động — xong trong vài phút, trước
              khi ký ức kịp nhòe đi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
