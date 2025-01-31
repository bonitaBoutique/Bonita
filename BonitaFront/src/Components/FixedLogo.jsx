import logo from "../assets/img/logoNombre.png"; // Ajusta la ruta según tu proyecto
import { Link } from "react-router-dom";

const FixedLogo = () => {
    return (
      <div className="fixed  top-0 md:-top-4 left-0 z-50">
         <Link to="/">
        <img src={logo} alt="Logo" className="w-56 md:w-20 lg:w-96 cursor-pointer" />
      </Link>
      </div>
    );
  };
  
  export default FixedLogo;
