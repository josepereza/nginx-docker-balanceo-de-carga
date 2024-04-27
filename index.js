const express = require("express");
const app = express();
require('dotenv').config()
console.log(process.env) 
app.get("/", (req, res) => {
  console.log("Hola mundo desde nginx");
  res.send({msg:"hola mjndo", port:process.env.PORT});
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor Express iniciado en el puerto ${process.env.PORT}`);
});