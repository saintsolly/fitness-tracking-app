export default function ProgressRing({ progress = 0, label, valueText }) {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  return (
    <div className="progress-ring">
      <div
        className="progress-ring__indicator"
        style={{
          background: `conic-gradient(var(--accent) ${safeProgress * 360}deg, var(--surface-muted) 0deg)`,
        }}
      >
        <div className="progress-ring__content">
          <strong>{Math.round(safeProgress * 100)}%</strong>
          {valueText && <span>{valueText}</span>}
        </div>
      </div>
      {label && <p className="progress-ring__label">{label}</p>}
    </div>
  );
}

