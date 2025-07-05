import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const WhatsappButton = () => {
  return (
    <a
      href="https://wa.me/573118318191" // Reemplaza con tu número de WhatsApp
      className="fixed bottom-4 right-8 bg-pink-400 text-white rounded-full p-4 shadow-lg hover:bg-pink-600 transition duration-300 transform hover:scale-110 hover:animate-bounce z-50 md:bottom-8 md:right-10"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FontAwesomeIcon icon={faWhatsapp} size="3x" />
    </a>
  );
}

export default WhatsappButton;