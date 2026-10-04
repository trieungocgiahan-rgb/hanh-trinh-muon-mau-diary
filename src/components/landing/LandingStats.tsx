const stats = [
  { value: "6", label: "loại hoạt động để phân loại" },
  { value: "3", label: "vai trò: quản trị, thành viên, người xem" },
  { value: "100%", label: "tệp đính kèm được lưu riêng tư" },
  { value: "2", label: "định dạng báo cáo: Markdown & Word" },
];

export function LandingStats() {
  return (
    <section className="bg-gradient-to-b from-[oklch(0.975_0.02_60)] to-background py-16">
      <div className="surface mx-auto grid max-w-5xl grid-cols-2 gap-x-5 gap-y-10 rounded-2xl px-6 py-10 text-center sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative after:absolute after:-right-2.5 after:top-1/2 after:hidden after:h-12 after:w-px after:-translate-y-1/2 after:bg-gradient-to-b after:from-transparent after:via-border after:to-transparent sm:after:block sm:last:after:hidden"
          >
            <p className="text-gradient font-display text-4xl font-extrabold tabular-nums sm:text-5xl">
              {s.value}
            </p>
            <p className="mx-auto mt-1.5 max-w-[11rem] text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
