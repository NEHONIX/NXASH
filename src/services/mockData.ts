export const mockTeacher = {
  id: 1,
  name: 'Jean Dupont',
  email: 'prof@nehonix.com',
  avatar: '/avatars/teacher.jpg',
};

export const mockCourses = [
  {
    id: 1,
    title: 'Introduction à React',
    description: 'Apprenez les bases de React et créez vos premières applications.',
    thumbnail: '/course-images/react.jpg',
    status: 'published',
    studentCount: 25,
    lessonCount: 12,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-21T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'JavaScript Avancé',
    description: 'Maîtrisez les concepts avancés de JavaScript.',
    thumbnail: '/course-images/javascript.jpg',
    status: 'draft',
    studentCount: 0,
    lessonCount: 8,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-21T00:00:00.000Z',
  },
];

export const mockAuth = {
  login: async (credentials: { email: string; password: string }) => {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === 'prof@nehonix.com' && credentials.password === 'password123') {
      return {
        token: 'mock-jwt-token',
        user: mockTeacher,
      };
    }

    throw new Error('Email ou mot de passe incorrect');
  },

  getCurrentUser: async () => {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockTeacher;
  },
};
