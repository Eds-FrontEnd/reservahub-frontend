import "./FooterStyle.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} ReservaHub. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
