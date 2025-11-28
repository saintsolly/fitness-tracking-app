import Card from './Card';

export default function StatList({ title, stats }) {
  return (
    <Card>
      <header className="list-header">
        <h3>{title}</h3>
      </header>
      <ul className="stat-list">
        {stats.map((stat) => (
          <li key={stat.id}>
            <div>
              <p>{stat.label}</p>
              {stat.subLabel && <small>{stat.subLabel}</small>}
            </div>
            <strong>{stat.value}</strong>
          </li>
        ))}
      </ul>
    </Card>
  );
}

