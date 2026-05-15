import { Navigate } from 'react-router-dom';

/** Legacy route — Task Board lives at /board */
export default function Kanban() {
  return <Navigate to="/board" replace />;
}
