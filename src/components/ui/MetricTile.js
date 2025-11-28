import Card from './Card';

export default function MetricTile({
  label,
  value,
  unit,
  delta,
  trendLabel,
  accent = 'primary',
}) {
  return (
    <Card className={`metric-tile metric-tile--${accent}`}>
      <header>
        <p>{label}</p>
        {trendLabel && <span>{trendLabel}</span>}
      </header>
      <div className="metric-tile__value">
        <span>{value}</span>
        {unit && <small>{unit}</small>}
      </div>
      {delta !== undefined && (
        <p className={`metric-tile__delta ${delta >= 0 ? 'up' : 'down'}`}>
          {delta >= 0 ? '+' : ''}
          {delta}%
        </p>
      )}
    </Card>
  );
}

