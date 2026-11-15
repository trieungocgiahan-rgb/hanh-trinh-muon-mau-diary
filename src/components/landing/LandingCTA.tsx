import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const nb = (s: string) => s.replace(/ (\S+)$/, "\u00A0$1");

export function LandingCTA() {
  const { t } = useI18n();
  return (
    <section className="px-5 pb-16 sm:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-2xl bg-[var(--page-tint)] px-6 py-12 sm:flex-row sm:items-center sm:px-12 sm:py-14">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {t("cta.title1")} {nb(t("cta.title2"))}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("cta.sub")}</p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link to="/auth">
            {t("common.enterJournal")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
