import { Link } from "react-router-dom";
import LogoReservaHub from "../../assets/images/logo/reservahub_logo.webp";

export const Logo = () => {
  return (
    <Link className="logo" to="/" aria-label="ReservaHub - página inicial">
      <img
        src={LogoReservaHub}
        alt="ReservaHub"
        width="158"
        height="34"
        decoding="async"
      />
    </Link>
  );
};
