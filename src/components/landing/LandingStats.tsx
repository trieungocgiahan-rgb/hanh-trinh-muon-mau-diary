const stats = [
  { value: "150+", label: "người bạn quay lại" },
  { value: "60+", label: "khoảnh khắc được lưu" },
  { value: "25+", label: "hoạt động đã ghi" },
  { value: "100%", label: "câu chuyện được giữ lại" },
];

export function LandingStats() {
  return (
    <section className="bg-gradient-blush py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 text-center sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
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
