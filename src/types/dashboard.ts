export interface Schedule {
  id: string;
  courseId: string;
  instructorId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  course: {
    id: string;
    title: string;
    thumbnail: string;
  };
}

export interface ScheduleResponse {
  schedules: Schedule[];
  total: number;
  period: {
    start: string;
    end: string;
  };
}
