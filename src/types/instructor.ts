export interface IInstructor {
  uid: string;
  email: string;
  name: string;
  role: "instructor";
  phone?: string;
  picture?: string;
  bio?: string;
  specialties: string[];
  qualifications: {
    diplomas: string[];
    certifications: string[];
    experience: number; // années d'expérience
  };
  ratings: {
    average: number;
    count: number;
  };
  stats: {
    totalStudents: number;
    totalCourses: number;
    completionRate: number;
  };
  isActive: boolean;
  isQualified: boolean;
  availability: {
    schedule: {
      [key: string]: { // "monday", "tuesday", etc.
        start: string; // "09:00"
        end: string; // "17:00"
      };
    };
    exceptions: {
      date: string;
      available: boolean;
      reason?: string;
    }[];
  };
  paymentInfo: {
    paypalEmail?: string;
    bankAccount?: {
      iban: string;
      bic: string;
      accountName: string;
    };
  };
  preferences: {
    notificationEmail: boolean;
    notificationSMS: boolean;
    language: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface InstructorLoginDTO {
  email: string;
  password: string;
}

export interface InstructorRegistrationDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
  specialties: string[];
  qualifications: {
    diplomas: string[];
    certifications: string[];
    experience: number;
  };
  bio?: string;
}
