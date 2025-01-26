export const mockCourses = [
  {
    id: '1',
    title: 'Introduction à HTML & CSS',
    description: 'Apprenez les bases du développement web avec HTML et CSS',
    progress: 100,
    duration: '2h 30min',
    instructor: 'Sarah Johnson',
    modules: [
      { title: 'Structure HTML', completed: true },
      { title: 'Styles CSS de base', completed: true },
      { title: 'Mise en page responsive', completed: true }
    ]
  },
  {
    id: '2',
    title: 'JavaScript Fondamentaux',
    description: 'Maîtrisez les concepts de base de JavaScript',
    progress: 60,
    duration: '3h 45min',
    instructor: 'Mike Thompson',
    modules: [
      { title: 'Variables et Types', completed: true },
      { title: 'Fonctions et Portée', completed: true },
      { title: 'DOM Manipulation', completed: false },
      { title: 'Événements', completed: false }
    ]
  },
  {
    id: '3',
    title: 'React pour Débutants',
    description: 'Créez des applications web modernes avec React',
    progress: 30,
    duration: '4h 15min',
    instructor: 'Emma Davis',
    modules: [
      { title: 'Introduction à React', completed: true },
      { title: 'Components et Props', completed: false },
      { title: 'State et Lifecycle', completed: false },
      { title: 'Hooks', completed: false }
    ]
  }
]

export const mockUser = {
  id: '1',
  name: 'John Doe',
  matricule: 'NEH001',
  phone: '123456789',
  email: 'john.doe@email.com',
  joinDate: '2024-01-01',
  subscription: {
    status: 'active',
    plan: 'Premium',
    nextPayment: '2024-02-01',
    amount: 25000
  },
  referrals: [
    { name: 'Alice Smith', status: 'active', date: '2024-01-05' },
    { name: 'Bob Johnson', status: 'pending', date: '2024-01-10' },
    { name: 'Carol White', status: 'active', date: '2024-01-15' }
  ]
}
