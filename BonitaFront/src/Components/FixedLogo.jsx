import logo from "../assets/img/logoNombre.png"; // Ajusta la ruta según tu proyecto

const FixedLogo = () => {
    return (
      <div className="fixed  top-0 md:-top-4 left-0 z-50">
        <img src={logo} alt="Logo" className="w-56 md:w-20 lg:w-96" />
      </div>
    );
  };
  
  export default FixedLogo;
