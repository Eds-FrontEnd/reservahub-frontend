import { Link } from "react-router-dom";

import LogoReservaHub from "../../assets/images/logo/reservahub_logo.webp";
import LogoReservaHubDark from "../../assets/images/logo/reservahub_logo_dark.webp";
import { useDarkTheme } from "../../contexts/DarkThemeContext";

export const Logo = () => {
  const { isDarkMode } = useDarkTheme();

  return (
    <Link className="logo" to="/" aria-label="ReservaHub - página inicial">
      <img
        src={isDarkMode ? LogoReservaHubDark : LogoReservaHub}
        alt="ReservaHub"
        width="158"
        height="34"
        decoding="async"
      />
    </Link>
  );
};
