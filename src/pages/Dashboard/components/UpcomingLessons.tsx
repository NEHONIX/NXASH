import { useSelector } from "react-redux";
import { RootState } from "@/store";
import "./UpcomingLessons.scss";

const LessonCard = ({ lesson }: { lesson: any }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div key={lesson.id} className="lesson-item">
      <div className="lesson-time">
        <span className="date">{formatDate(lesson.startTime)}</span>
        <div className="time-range">
          <span className="time">{formatTime(lesson.startTime)}</span>
          <span className="separator">-</span>
          <span className="time">{formatTime(lesson.endTime)}</span>
        </div>
      </div>
      <div className="lesson-info">
        <div className="course-image">
          <img src={lesson.courseImage} alt={lesson.courseName} />
        </div>
        <div className="course-details">
          <h3>{lesson.title}</h3>
          <p className="course-name">{lesson.courseName}</p>
          {lesson.description && (
            <p className="description">{lesson.description}</p>
          )}
        </div>
      </div>
      <div className="lesson-status" data-status={lesson.status}>
        {lesson.status}
      </div>
    </div>
  );
};

const UpcomingLessons = () => {
  const { upcomingLessons } = useSelector(
    (state: RootState) => state.dashboard
  );

  return (
    <div className="upcoming-lessons">
      <h2>Prochains cours</h2>
      <div className="lessons-list">
        {upcomingLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
        {upcomingLessons.length === 0 && (
          <p className="no-lessons">Aucun cours à venir</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingLessons;
