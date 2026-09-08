import {
  Facebook,
  Instagram,
  LinkedIn,
  Twitter,
  WhatsApp,
} from "@mui/icons-material";

import "./FooterStyle.css";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: <Instagram />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: <Facebook />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: <LinkedIn />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/",
    icon: <Twitter />,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/",
    icon: <WhatsApp />,
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__content">
        <p>© {currentYear} ReservaHub. Todos os direitos reservados.</p>

        <nav aria-label="Redes sociais">
          <ul className="footer__social-list">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Acessar ${social.label}`}
                >
                  {social.icon}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
