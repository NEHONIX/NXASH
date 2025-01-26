import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchWeekSchedule, setCurrentWeek } from '@/store/slices/scheduleSlice';
import { FiPlus, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import NewScheduleModal from './components/NewScheduleModal';
import './Schedule.scss';

const Schedule = () => {
  const dispatch = useDispatch();
  const { scheduledCourses, loading, error, currentWeek } = useSelector(
    (state: RootState) => state.schedule
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    const weekDates = getWeekDates(new Date());
    dispatch(setCurrentWeek(weekDates));
    dispatch(fetchWeekSchedule(weekDates) as any);
  }, [dispatch]);

  const nextWeek = () => {
    const next = new Date(currentWeek.startDate);
    next.setDate(next.getDate() + 7);
    const weekDates = getWeekDates(next);
    dispatch(setCurrentWeek(weekDates));
    dispatch(fetchWeekSchedule(weekDates) as any);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeek.startDate);
    prev.setDate(prev.getDate() - 7);
    const weekDates = getWeekDates(prev);
    dispatch(setCurrentWeek(weekDates));
    dispatch(fetchWeekSchedule(weekDates) as any);
  };

  const handleOpenModal = (date?: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="spinner"></div>
        <p>Chargement du planning...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <p>Une erreur est survenue lors du chargement du planning.</p>
        <button onClick={() => dispatch(fetchWeekSchedule(currentWeek) as any)}>
          Réessayer
        </button>
      </div>
    );
  }

  const getCoursesForTimeSlot = (day: string, hour: number) => {
    return scheduledCourses.filter((course) => {
      const courseDate = new Date(course.startTime);
      const courseHour = courseDate.getHours();
      const courseDay = courseDate.toLocaleDateString('fr-FR', { weekday: 'long' });
      return courseDay.toLowerCase() === day.toLowerCase() && courseHour === hour;
    });
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Planning</h1>
        <div className="header-actions">
          <div className="date-navigation">
            <button onClick={prevWeek}>
              <FiChevronLeft />
            </button>
            <span>
              Semaine du{' '}
              {new Date(currentWeek.startDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
            <button onClick={nextWeek}>
              <FiChevronRight />
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus className="icon" />
            Nouveau cours
          </button>
        </div>
      </div>

      <div className="schedule-grid">
        <div className="time-column">
          {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
            <div key={hour} className="time-slot">
              {`${hour}:00`}
            </div>
          ))}
        </div>
        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((day) => (
          <div key={day} className="day-column">
            <div className="day-header">{day}</div>
            {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => {
              const courses = getCoursesForTimeSlot(day, hour);
              return (
                <div 
                  key={hour} 
                  className="time-block"
                  onClick={() => {
                    const date = new Date(currentWeek.startDate);
                    const dayIndex = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'].indexOf(day.toLowerCase());
                    date.setDate(date.getDate() + dayIndex);
                    date.setHours(hour);
                    handleOpenModal(date);
                  }}
                >
                  {courses.map((course) => (
                    <div key={course.id} className="scheduled-course">
                      <h4>{course.title}</h4>
                      <span>
                        {new Date(course.startTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(course.endTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <NewScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Schedule;
