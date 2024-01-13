import { useState, useEffect } from "react";
import { Col, Row } from 'reactstrap';
import axios from 'axios';

import '../styles/visualize.css'

const Submits = () => {

  const [arraySubmits, setArraySubmits] = useState([])

  useEffect(() => {
    const getData = async () => {
      let arrayData = await axios.get("http://localhost:5000/get_data")
      setArraySubmits(arrayData.data.array)
    }
    getData();
  }, []); // El segundo argumento vacío [] garantiza que se ejecute solo una vez al montar el componente

  const crearImagenDesdePuntos = (puntos, canvasWidth, canvasHeight) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext('2d');

    // Dibujar cada punto en el canvas
    puntos.forEach((punto) => {
      context.beginPath();
      context.arc(punto.x, punto.y, 3, 0, 2 * Math.PI);
      context.fillStyle = 'black';
      context.fill();
      context.closePath();
    });

    // Obtener la representación de la imagen en formato de datos URL
    console.log(canvas)
    const imageDataUrl = canvas.toDataURL();
    return imageDataUrl;
  };


  return (
    <div className="container">
      <Row className="custom-grid">
        <Col className="d-flex justify-content-center align-items-center" style={{ fontSize: "40px" }}>
          Database
        </Col>
        <Col>
        </Col>

      </Row>
      {arraySubmits.map((campo, index) => (
        <Row key={index} className="custom-grid">
          <Col md={4} className="d-flex justify-content-center align-items-center">
            <div> {campo.name}</div>
          </Col>

          <Col md={4} className="d-flex justify-content-center align-items-center">
            <div>{campo.email}</div>
          </Col>

          <Col md={4} className="d-flex justify-content-center align-items-center">
            <div><img className="image" src={crearImagenDesdePuntos(campo.canvas.data, campo.canvas.width, campo.canvas.height)} alt="" /></div>
          </Col>

        </Row>
      ))}
    </div>
  );
}

export default Submits