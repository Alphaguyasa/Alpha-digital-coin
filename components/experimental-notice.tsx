// Shown on every page, as the project rules require. tests/policy.test.ts checks that it
// stays in place, so change the wording here rather than removing it.
export function ExperimentalNotice() {
  return (
    <p role="note" className="border-t border-brand/25 bg-background p-4 text-center text-[13px] leading-relaxed text-foreground/70">
      Experimental software, not financial advice. ALPHA has no price and is not an
      investment. This project runs on a local development network, has had no security
      audit, and is not offered to the public.
    </p>
  );
}
