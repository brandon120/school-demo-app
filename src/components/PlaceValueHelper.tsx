import type { CSSProperties } from "react";
import { getExpandedBreakdown } from "../utils/problems";

interface PlaceValueHelperProps {
  a: number;
  b: number;
}

function PlaceValueColumn({
  label,
  digit,
  value,
  color,
}: {
  label: string;
  digit: number;
  value: number;
  color: string;
}) {
  return (
    <div className="pv-column" style={{ "--pv-color": color } as CSSProperties}>
      <span className="pv-label">{label}</span>
      <div className="pv-blocks">
        {Array.from({ length: digit }).map((_, i) => (
          <span key={i} className="pv-block" />
        ))}
      </div>
      <span className="pv-digit">{digit}</span>
      <span className="pv-value">{value > 0 ? value : "—"}</span>
    </div>
  );
}

export default function PlaceValueHelper({ a, b }: PlaceValueHelperProps) {
  const aBreak = getExpandedBreakdown(a);
  const bBreak = getExpandedBreakdown(b);

  return (
    <div className="place-value-helper">
      <p className="pv-title">Place Value Helper</p>
      <div className="pv-numbers">
        <div className="pv-number-row">
          <span className="pv-number-label">{a}</span>
          <div className="pv-columns">
            <PlaceValueColumn label="H" digit={aBreak.hDigit} value={aBreak.hundreds} color="#ff6b9d" />
            <PlaceValueColumn label="T" digit={aBreak.tDigit} value={aBreak.tens} color="#4ecdc4" />
            <PlaceValueColumn label="O" digit={aBreak.oDigit} value={aBreak.ones} color="#ffe66d" />
          </div>
        </div>
        <div className="pv-plus">+</div>
        <div className="pv-number-row">
          <span className="pv-number-label">{b}</span>
          <div className="pv-columns">
            <PlaceValueColumn label="H" digit={bBreak.hDigit} value={bBreak.hundreds} color="#ff6b9d" />
            <PlaceValueColumn label="T" digit={bBreak.tDigit} value={bBreak.tens} color="#4ecdc4" />
            <PlaceValueColumn label="O" digit={bBreak.oDigit} value={bBreak.ones} color="#ffe66d" />
          </div>
        </div>
      </div>
      <p className="pv-tip">
        H = Hundreds · T = Tens · O = Ones — Add each column!
      </p>
    </div>
  );
}
