import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.png.asset.json";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-secondary/45 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2.5 font-display text-xl font-extrabold text-foreground">
            <img
              src={logoAsset.url}
              alt="Nhật Ký Hành Trình"
               className="h-10 w-10 rounded-lg object-cover shadow-soft"
            />
            Nhật Ký Hành Trình
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Nơi lưu giữ hành trình của các dự án cộng đồng — do đội Nét Mơ chăm sóc.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Khám phá</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#ve-chung-toi" className="hover:text-primary">
                Vì sao có nơi này
              </a>
            </li>
            <li>
              <a href="#khoanh-khac" className="hover:text-primary">
                Khoảnh khắc
              </a>
            </li>
            <li>
              <a href="#cam-nhan" className="hover:text-primary">
                Cảm nhận
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Tham gia</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="hover:text-primary">
                Đăng nhập với Google
              </Link>
            </li>
            <li>
               <Link to="/auth" className="hover:text-primary">Tham gia hành trình</Link>
             </li>
          </ul>
        </div>
      </div>

      <p className="mt-10 text-center font-hand text-lg text-muted-foreground">
        © {new Date().getFullYear()} Nhật Ký Hành Trình · viết bằng rất nhiều thương mến
      </p>
    </footer>
  );
}
