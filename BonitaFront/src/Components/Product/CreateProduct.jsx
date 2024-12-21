import { useState } from "react";
import { useDispatch } from "react-redux";
import { createProduct } from "../../Redux/Actions/actions";
import { useNavigate } from "react-router-dom";
import { openCloudinaryWidget } from "../../cloudinaryConfig";
import Swal from "sweetalert2";

//Cod,FECHA INICIAL,marca,COD PROV,DESCRIPCION,Talla ,Color ,CANT, PRECIO,, VENTA,,ESTATUS, codigo barras

const CreateProduct = () => {
  const [fecha, setFecha] = useState("");
  const [marca, setMarca] = useState("");
  const [codigoProv, setCodigoProv] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("");
  const [price, setPrice] = useState("");
  const [priceSell, setPriceSell]= useState("")
  const [stock, setStock] = useState("");
  const [colors, setColors] = useState("");
  const [images, setImages] = useState([]);

  const [alertMessage, setAlertMessage] = useState("");
  const [isDian, setIsDian] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleWidget = () => {
    openCloudinaryWidget((uploadedImageUrl) => {
      setImages((prevImages) => [...prevImages, uploadedImageUrl]);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (
      !fecha ||
      !marca ||
      !codigoProv ||
      !description ||
      !price ||
      !priceSell||
      !stock ||
      !colors ||
      !sizes ||
      images.length === 0
    ) {
      console.log("Campos incompletos");
      setAlertMessage(
        "Por favor complete todos los campos y seleccione al menos una imagen."
      );
      return;
    }

    const productData = {
      fecha,
      marca,
      description,
      codigoProv,
      price,
      priceSell,
      stock,
      images,
      sizes,
      colors,
      isDian,
    };

    console.log(productData);

    try {
      console.log("Data being dispatched:", productData); // Log del objeto que se despacha
      const result = await dispatch(createProduct(productData)); // Guardar el resultado del dispatch
      console.log("Dispatch result:", result); // Log del resultado del dispatch

      Swal.fire({
        title: "OK",
        text: "Producto creado exitosamente",
        icon: "success",
        confirmButtonText: "OK",
      });

      setFecha("");
      setMarca("");
      setDescription("");
      setCodigoProv("");
      setPrice("");
      setPriceSell("");
      setStock("");
      setImages([]);
      setSizes("");
      setColors("");
      setIsDian(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error during dispatch:", error); // Log de cualquier error en el dispatch
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
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto mt-10 p-6 bg-gray-300 rounded-lg shadow-xl grid grid-cols-2 gap-6"
      >
        <h2 className="col-span-2 text-3xl font-bold font-nunito bg-colorBeige p-4 rounded text-center text-gray-600">
          Cargar nuevo Artículo
        </h2>

        <div>
          <label
            htmlFor="fecha"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="marca"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="codigoProv"
            className="block text-sm font-medium text-gray-700"
          >
            Proveedor
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
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="priceSell"
            className="block text-sm font-medium text-gray-700"
          >
            Precio de Venta
          </label>
          <input
            type="number"
            value={priceSell}
            onChange={(e) => setPriceSell(e.target.value)}
            placeholder="Precio de Venta"
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label className="block text-sm font-medium text-gray-700">
            Imágenes
          </label>
          <button
            type="button"
            onClick={handleWidget}
            className="mt-1 block w-full py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700"
          >
            Subir Imágenes
          </button>

          {/* Muestra las imágenes seleccionadas */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="sizes"
            className="block text-sm font-medium text-gray-700"
          >
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
          <label
            htmlFor="colors"
            className="block text-sm font-medium text-gray-700"
          >
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
        <div>
          <label
            htmlFor="isDian"
            className="block text-sm font-medium text-gray-700"
          >
           Codificado?
          </label>
          <select
            value={isDian.toString()} // Convierte el booleano a string para el select
            onChange={(e) => setIsDian(e.target.value === "true")}
            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        <div className="col-span-2 text-center">
          <button
            type="submit"
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
