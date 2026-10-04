const stats = [
  { value: "150+", label: "người bạn quay lại" },
  { value: "60+", label: "khoảnh khắc được lưu" },
  { value: "25+", label: "hoạt động đã ghi" },
  { value: "100%", label: "câu chuyện được giữ lại" },
];

export function LandingStats() {
  return (
    <section className="border-y border-border/60 bg-background py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-5 gap-y-10 px-5 text-center sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="relative after:absolute after:-right-2 after:top-1/2 after:hidden after:h-10 after:w-px after:-translate-y-1/2 after:bg-border sm:after:block sm:last:after:hidden">
            <p className="font-display text-4xl font-extrabold text-primary sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-secondary-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
