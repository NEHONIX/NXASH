export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue',
    green: 'bg-green',
    purple: 'bg-purple',
    orange: 'bg-orange'
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
