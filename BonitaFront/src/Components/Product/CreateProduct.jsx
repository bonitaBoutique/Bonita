import  { useState} from "react";
import { useDispatch } from "react-redux";
import { createProduct} from "../../Redux/Actions/actions";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


//Cod,FECHA INICIAL,marca,COD PROV,DESCRIPCION,Talla ,Color ,CANT, PRECIO,, VENTA,,ESTATUS, codigo barras

const CreateProduct = () => {
const [codigo, setCodigo]= useState("");
const [fecha, setFecha] = useState(""); 
const [marca, setMarca] = useState("");
const [codigoProv, setCodigoProv] = useState("")
const [description, setDescription] = useState("");
const [sizes, setSizes] = useState("");
const [price, setPrice] = useState("");
const [stock, setStock] = useState("");
const [colors, setColors] = useState("");
const [images, setImages] = useState([]);
const [isOffer, setIsOffer] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
const dispatch = useDispatch();
  
  
  const navigate = useNavigate();

  
  const handleImageChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setImages([...images, ...filesArray]);
  };

  const handleRemoveImage = (indexToRemove) => {
    const filteredImages = images.filter((_, index) => index !== indexToRemove);
    setImages(filteredImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      !codigo ||
      !fecha ||
      !marca ||
      !codigoProv ||
      !description ||
      !price ||
      !stock ||
      images.length === 0
      
    ) {
      setAlertMessage("Por favor complete todos los campos y seleccione al menos una imagen.");
      return;
    }
  
    // Generar el código de barras único
    const codigoBarra = `${fecha}${sizes}${colors}${Math.floor(price)}B${codigo}`.toUpperCase();
  
    const productData = {
      codigo,
      codigoBarra, 
      fecha,
      marca,
      description,
      codigoProv,
      price,
      stock,
      images,
      sizes,
      colors,
      isOffer,
    };
  
    console.log(productData);
  
    try {
      await dispatch(createProduct(productData));
  
      Swal.fire({
        title: "OK",
        text: "Producto creado exitosamente",
        icon: "success",
        confirmButtonText: "OK",
      });
  
      setCodigo("");
      setFecha("");
      setMarca("");
      setDescription("");
      setCodigoProv("");
      setPrice("");
      setStock("");
      setImages([]);
      setSizes("");
      setColors("");
      setMaterials("");
      setIsOffer(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Error al crear el producto",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

  return (
    <div className="bg-colorFooter min-h-screen pt-16">
      <form className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl grid grid-cols-2 gap-6">
  <h2 className="col-span-2 text-3xl font-bold font-nunito bg-yellow-600 p-4 rounded text-center text-gray-600">
    Cargar nuevo Artículo
  </h2>

  
  <div>
    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
      Fecha
    </label>
    <input
      type="text"
      value={fecha}
      onChange={(e) => setFecha(e.target.value)}
      placeholder="ej. 14524 DiaMesAño sin ceros"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
      Marca
    </label>
    <input
      type="text"
      value={marca}
      onChange={(e) => setMarca(e.target.value)}
      placeholder="Marca"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
      Descripción
    </label>
    <input
      type="text"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Description"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="codigoProv" className="block text-sm font-medium text-gray-700">
      Código Proveedor
    </label>
    <input
      type="text"
      value={codigoProv}
      onChange={(e) => setCodigoProv(e.target.value)}
      placeholder="Código Proveedor"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
      Precio
    </label>
    <input
      type="number"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      placeholder="Precio"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
      Cantidad Ingresada
    </label>
    <input
      type="number"
      value={stock}
      onChange={(e) => setStock(e.target.value)}
      placeholder="Stock"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div className="col-span-2">
    <label htmlFor="images" className="block text-sm font-medium text-gray-700">
      Imágenes
    </label>
    <input
      type="file"
      multiple
      onChange={handleImageChange}
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">
      Talle
    </label>
    <input
      type="text"
      value={sizes}
      onChange={(e) => setSizes(e.target.value)}
      placeholder="Talle"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div>
    <label htmlFor="colors" className="block text-sm font-medium text-gray-700">
      Color
    </label>
    <input
      type="text"
      value={colors}
      onChange={(e) => setColors(e.target.value)}
      placeholder="Color"
      className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
    />
  </div>

  <div className="col-span-2 text-center">
    <button
      onClick={handleSubmit}
      className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
    >
      Crear Producto
    </button>
  </div>
</form>

    </div>
  );
};

export default CreateProduct;

