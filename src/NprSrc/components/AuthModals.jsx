import PropTypes from "prop-types";
import LoginPage from "../pages/Auth/LoginPage";

export const AuthModals = ({ isOpen, mode = "login", onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0045b8] animate-fadeIn">
      <LoginPage initialMode={mode} onBack={onClose} onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

AuthModals.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mode: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSwitchMode: PropTypes.func,
  onLoginSuccess: PropTypes.func,
};

export default AuthModals;
