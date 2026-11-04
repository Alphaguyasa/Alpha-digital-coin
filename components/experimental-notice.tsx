// Shown on every page, as the project rules require. tests/policy.test.ts checks that it
// stays in place, so change the wording here rather than removing it.
export function ExperimentalNotice() {
  return (
    <p
      role="note"
      style={{
        background: "#0A0500",
        borderTop: "1px solid rgba(255,153,0,0.25)",
        color: "rgba(255,255,255,0.7)",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        lineHeight: 1.6,
        padding: "16px",
        textAlign: "center",
      }}
    >
      Experimental software, not financial advice. ALPHA has no price and is not an
      investment. This project runs on a local development network, has had no security
      audit, and is not offered to the public.
    </p>
  );
}
