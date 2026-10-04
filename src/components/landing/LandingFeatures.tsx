import { FileDown, Lock, Mic, ShieldCheck } from "lucide-react";
import { ACTIVITY_TYPES } from "@/lib/activity-constants";
import desk from "@/assets/landing-desk.jpg";
import group from "@/assets/landing-group.jpg";
import sunset from "@/assets/landing-sunset.jpg";

function Tile({
  className = "",
  title,
  children,
  body,
}: {
  className?: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`surface flex flex-col rounded-2xl p-6 ${className}`}>
      <h3 className="font-display text-xl font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      {children && <div className="mt-auto pt-5">{children}</div>}
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="tinh-nang" className="scroll-mt-20 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Tính năng
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight sm:text-5xl">
            Mọi thứ về một buổi hoạt động, <em className="text-gradient font-medium">ở một chỗ.</em>
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <div className="surface overflow-hidden rounded-2xl md:col-span-4 md:grid md:grid-cols-[1.1fr_1fr]">
            <div className="flex flex-col p-6">
              <h3 className="font-display text-xl font-semibold leading-snug">
                Lịch tháng, tô màu theo loại hoạt động
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Bấm vào ngày để thêm hoạt động mới, bấm vào hoạt động để xem chi tiết. Cần tìm lại
                thì chuyển sang danh sách, lọc theo loại hoặc trạng thái.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <li
                    key={t.value}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground/80"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.colorVar }}
                    />
                    {t.label}
                  </li>
                ))}
              </ul>
            </div>
            <img
              src={desk}
              alt="Bàn làm việc với ảnh in, sổ tay và giấy ghi chú"
              width={1008}
              height={1008}
              loading="lazy"
              className="h-56 w-full object-cover md:h-full"
            />
          </div>

          <Tile
            className="md:col-span-2"
            title="Ảnh, giọng nói, video, tài liệu"
            body="Kéo ảnh vào, ghi âm ngay trên trình duyệt, đính kèm PDF, Word hoặc đường dẫn Drive."
          >
            <div className="flex items-center gap-2">
              {[group, sunset].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 rounded-lg object-cover shadow-soft"
                />
              ))}
              <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-grape text-grape-foreground shadow-btn">
                <Mic className="h-6 w-6" />
              </span>
            </div>
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Ba vai trò rõ ràng"
            body="Quản trị viên duyệt thành viên, thành viên ghi và sửa hoạt động của mình, người xem chỉ đọc."
          >
            <ShieldCheck className="h-7 w-7 text-primary" />
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Riêng tư mặc định"
            body="Ảnh, ghi âm và tệp được lưu ở kho riêng. Chỉ thành viên của dự án mới mở được."
          >
            <Lock className="h-7 w-7 text-primary" />
          </Tile>

          <Tile
            className="md:col-span-2"
            title="Báo cáo gửi nhà tài trợ"
            body="Xuất toàn bộ hoạt động và số liệu thành file Markdown hoặc Word chỉ bằng một cú bấm."
          >
            <FileDown className="h-7 w-7 text-primary" />
          </Tile>
        </div>
      </div>
    </section>
  );
}
