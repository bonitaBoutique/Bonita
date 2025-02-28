const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3] || "output.json";

if (!inputFilePath) {
  console.error("Debe proporcionar el archivo CSV de entrada.");
  process.exit(1);
}

const results = [];

fs.createReadStream(path.resolve(inputFilePath))
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    fs.writeFileSync(path.resolve(outputFilePath), JSON.stringify(results, null, 2));
    console.log(`Archivo JSON generado en: ${outputFilePath}`);
  })
  .on("error", (error) => {
    console.error("Error al leer el CSV:", error);
  });