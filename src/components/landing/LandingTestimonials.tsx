import sunset from "@/assets/landing-sunset.jpg";

const quotes = [
  {
    name: "Linh N.",
    role: "Tình nguyện viên",
    text: "Mình đi công tác cả tháng, mở nhật ký ra là biết cả đội đã làm gì, cảm giác như chưa từng vắng mặt.",
  },
  {
    name: "Huy P.",
    role: "Điều phối dự án",
    text: "Trước đây ảnh và ghi chú nằm rải rác khắp nhóm chat. Giờ mọi thứ ở một chỗ, làm báo cáo nhanh hẳn.",
  },
  {
    name: "Mai T.",
    role: "Thành viên mới",
    text: "Đọc lại những buổi trước giúp mình hiểu dự án nhanh hơn nhiều, và thấy mình thuộc về nơi này.",
  },
];

export function LandingTestimonials() {
  return (
    <section id="cam-nhan" className="scroll-mt-20 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="text-center">
          <p className="font-hand text-2xl text-primary">Người thật, việc thật</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Điều cả đội nói về nhật ký này
          </h2>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1fr_1fr_1fr_0.8fr]">
          {quotes.map((q, i) => (
            <blockquote
              key={q.name}
              className={`surface surface-lift rounded-xl p-6 ${i === 1 ? "lg:mt-8" : ""}`}
            >
              <p className="font-display text-3xl leading-none text-primary" aria-hidden>
                “
              </p>
              <p className="text-sm leading-relaxed text-foreground">{q.text}</p>
              <footer className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-sun font-display text-sm font-bold text-sunny-foreground shadow-soft">
                  {q.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}

          <div className="mx-auto w-44 rotate-2 rounded-md border border-border/50 bg-card p-2 pb-5 shadow-pop lg:mt-4">
            <img
              src={sunset}
              alt="Hoàng hôn cuối một ngày hoạt động của dự án"
              width={912}
              height={1104}
              loading="lazy"
              className="h-40 w-full rounded-sm object-cover"
            />
            <p className="mt-2 text-center font-hand text-base text-muted-foreground">
              cùng nhau, dù ở xa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
