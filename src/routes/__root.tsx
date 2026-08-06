import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/use-auth";
import { ProjectProvider } from "@/hooks/use-project";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Không tìm thấy trang</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã được chuyển đi.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Về trang chính
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Trang không tải được
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Có gì đó chưa ổn. Bạn thử tải lại hoặc quay về trang chính nhé.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Về trang chính
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nhật Ký Hành Trình" },
      {
        name: "description",
        content:
          "Nhật ký hành trình của các dự án cộng đồng — ghi lại từng hoạt động, ảnh, ghi âm và xem trên lịch.",
      },
      { name: "author", content: "Nét Mơ" },
      { property: "og:title", content: "Nhật Ký Hành Trình" },
      {
        property: "og:description",
        content: "Ghi lại hành trình của dự án cộng đồng cùng cả đội.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Nhật Ký Hành Trình" },
      { name: "description", content: "nhật ký ghi lại hành trình hoạt động của dự án" },
      { property: "og:description", content: "nhật ký ghi lại hành trình hoạt động của dự án" },
      { name: "twitter:description", content: "nhật ký ghi lại hành trình hoạt động của dự án" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e972639-45be-4c02-8ae4-27017dabdfc3/id-preview-ec0478c3--15bd3bcd-e36b-4ab3-a0bc-7bc510ceee33.lovable.app-1781537729925.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e972639-45be-4c02-8ae4-27017dabdfc3/id-preview-ec0478c3--15bd3bcd-e36b-4ab3-a0bc-7bc510ceee33.lovable.app-1781537729925.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      const nextUserId = session?.user?.id ?? null;
      const changed = lastUserId.current !== nextUserId;
      lastUserId.current = nextUserId;
      // Only react to a real identity change. SIGNED_IN also fires on
      // token refresh / tab refocus with the same user — ignoring those
      // avoids refetch storms that snap pages back to the loading spinner.
      if (!changed && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);


  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </ProjectProvider>
      </AuthProvider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
