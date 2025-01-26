import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import './RecentActivity.scss';

const RecentActivity = () => {
  const { recentActivities } = useSelector((state: RootState) => state.dashboard);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_created':
        return '📚';
      case 'lesson_completed':
        return '✅';
      case 'student_enrolled':
        return '👤';
      case 'quiz_submitted':
        return '📝';
      default:
        return '🔔';
    }
  };

  return (
    <div className="recent-activity">
      <h2>Activités récentes</h2>
      <div className="activity-list">
        {recentActivities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <p className="activity-message">{activity.message}</p>
              <span className="activity-time">
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {recentActivities.length === 0 && (
          <p className="no-activity">Aucune activité récente</p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
