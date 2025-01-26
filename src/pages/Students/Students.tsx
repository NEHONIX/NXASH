import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  fetchStudents,
  setSearchQuery,
  searchStudents,
} from "@/store/slices/studentsSlice";
import { FiSearch, FiFilter, FiEye } from "react-icons/fi";
import "./Students.scss";

const Students = () => {
  const dispatch = useDispatch();
  const {
    students: studentDatas,
    loading,
    error,
    searchQuery,
  } = useSelector((state: RootState) => state.students);

  const students = studentDatas.students;

  //console.log("students: ", students);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.length >= 3) {
      dispatch(searchStudents(query) as any);
    } else if (query.length === 0) {
      dispatch(fetchStudents() as any);
    }
  };

  if (loading) {
    return (
      <div className="students-loading">
        <div className="spinner"></div>
        <p>Chargement des étudiants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-error">
        <p>Une erreur est survenue lors du chargement des étudiants.</p>
        <button onClick={() => dispatch(fetchStudents() as any)}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="students-page">
      <div className="students-header">
        <h1>Mes étudiants</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FiSearch className="icon" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <FiFilter className="icon" />
            Filtrer
          </button>
        </div>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Progression</th>
              <th>Cours inscrits</th>
              <th>Dernière activité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${student.stats.averageProgress}%` }}
                    />
                    <span>{student.stats.averageProgress}%</span>
                  </div>
                </td>
                <td>{student.stats.completedCourses} cours</td>
                <td>
                  {new Date(student.stats.lastActive).toLocaleDateString()}
                </td>
                <td>
                  <button className="btn-icon" title="Voir le profil">
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="no-students">
            <p>Aucun étudiant trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
