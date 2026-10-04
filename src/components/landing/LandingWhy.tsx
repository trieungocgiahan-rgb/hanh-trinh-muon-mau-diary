import group from "@/assets/landing-group.jpg";

const steps = [
  {
    n: "01",
    title: "Không ai bị bỏ lại",
    body: "Mọi hoạt động đều được ghi lại ngay trong ngày, ai vắng mặt vẫn nắm được cả câu chuyện.",
  },
  {
    n: "02",
    title: "Sống lại & kết nối",
    body: "Ảnh, ghi âm, cảm xúc của từng buổi — mở ra là thấy lại đúng không khí hôm đó.",
  },
  {
    n: "03",
    title: "Như đang có mặt",
    body: "Thả tim, bình luận, điểm danh, góp ảnh — hành trình trở nên sống động cùng cả đội.",
  },
];

export function LandingWhy() {
  return (
    <section id="ve-chung-toi" className="scroll-mt-20 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <img
              src={group}
              alt="Các bạn tình nguyện viên ngồi cùng nhau trong một buổi workshop"
              width={1200}
              height={912}
              loading="lazy"
               className="-rotate-1 rounded-lg border border-border/70 object-cover shadow-pop"
            />
             <div className="absolute -bottom-8 -right-2 w-44 rotate-2 rounded-md border border-sunny/60 bg-sunny/80 p-4 shadow-pop">
              <p className="font-hand text-lg leading-snug text-sunny-foreground">
                “ghi lại đi, mai này đọc lại thấy thương lắm”
              </p>
            </div>
          </div>

          <div>
            <p className="font-hand text-2xl text-primary">Vì sao có nơi này?</p>
            <h2 className="mt-2 font-display text-3xl leading-tight font-extrabold text-foreground sm:text-4xl">
              Không còn ai lạc nhịp.
              <br />
              Chỉ còn sự gắn bó.
            </h2>
            <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
              Dự án cộng đồng đi qua rất nhiều người và rất nhiều ngày. Nhật ký này giữ
              lại mạch câu chuyện, để người mới hiểu được quá khứ và người cũ không quên
              điều đã làm.
            </p>

            <div className="mt-9 space-y-5">
              {steps.map((s, i) => (
                <div key={s.n} className="relative pl-14">
                  <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-sun font-display text-sm font-bold text-sunny-foreground shadow-soft">
                    {s.n}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-5 top-11 h-[calc(100%-1.5rem)] border-l-2 border-dashed border-primary/30"
                    />
                  )}
                  <h3 className="font-display text-lg font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
