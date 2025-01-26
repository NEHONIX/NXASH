export const BASE_URL_API = ({ isStudent = true }) => {
  if (!isStudent) return "https://nxash.onrender.com/api";
  return `https://nxash.onrender.com/api/student`;
};
