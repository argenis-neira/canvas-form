import { useState, useRef, useEffect } from "react";
import { useFormik } from 'formik';
import { Col, Row } from 'reactstrap';
import axios from 'axios';

const validate = values => {
        let errors = {}
        //es cambiante los campos
        if (!values.name) errors.name = "Campo obligatorio"
        if (!values.email) errors.email = "Campo obligatorio"
        return errors
}

const CanvasComponent = () => {
        const [isDrawing, setIsDrawing] = useState(false);
        const [startX, setStartX] = useState(0);
        const [startY, setStartY] = useState(0);

        const canvasRef = useRef(null)
        const undoHistoryRef = useRef([]);
        const [isUndoDisabled, setIsUndoDisabled] = useState(true);

        const [isEmptyCanvas, setIsEmptyCanvas] = useState(false)

        const handleStart = (event) => {
                setIsDrawing(true);
                const canvas = event.target;
                const rect = canvas.getBoundingClientRect();
                setStartX((event.clientX - rect.left) / (rect.width / canvas.width) || (event.touches[0].clientX - rect.left) / (rect.width / canvas.width));
                setStartY((event.clientY - rect.top) / (rect.height / canvas.height) || (event.touches[0].clientY - rect.top) / (rect.height / canvas.height));


                setIsUndoDisabled(true);

        };

        const handleMove = (event) => {
                if (!isDrawing) return;

                const canvas = event.target;
                const context = canvas.getContext('2d');
                const rect = canvas.getBoundingClientRect();
                const x = (event.clientX - rect.left) / (rect.width / canvas.width) || (event.touches[0].clientX - rect.left) / (rect.width / canvas.width);
                const y = (event.clientY - rect.top) / (rect.height / canvas.height) || (event.touches[0].clientY - rect.top) / (rect.height / canvas.height);

                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(x, y);
                context.stroke();

                setStartX(x);
                setStartY(y);

        };

        const handleEnd = (e) => {
                e.preventDefault()
                setIsDrawing(false);


                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                // Dibujar el punto inicial
                context.beginPath();
                context.arc(startX, startY, 1.5, 0, 2 * Math.PI);
                context.fill();

                const canvasCopy = document.createElement("canvas");
                canvasCopy.width = canvas.width;
                canvasCopy.height = canvas.height;
                //las siguientes lineas dibujan en el canvas nuevo lo que acabamos de dibujar.
                //siempmre se esta creando un nuevo canvas que almacene todos los lienzos, siempre debe hacerse una copia
                const copyContext = canvasCopy.getContext("2d");
                copyContext.drawImage(canvas, 0, 0);
                undoHistoryRef.current.push(canvasCopy);

                setIsUndoDisabled(false);
        };

        const handleUndo = () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (undoHistoryRef.current.length === 1) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        undoHistoryRef.current = [];
                        setIsUndoDisabled(true);
                        return
                }

                if (undoHistoryRef.current.length > 0) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        undoHistoryRef.current.pop(); // Elimina el último paso del historial
                        context.drawImage(undoHistoryRef.current[undoHistoryRef.current.length - 1], 0, 0);

                        if (undoHistoryRef.current.length === 0) {
                                setIsUndoDisabled(true);
                        }
                }
        };

        const handleClear = () => {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                context.clearRect(0, 0, canvas.width, canvas.height);
                undoHistoryRef.current = [];
                setIsUndoDisabled(true);
        };

        useEffect(() => {
                const canvas = canvasRef.current;
                const adjustCanvasWidth = () => {
                        const parentDiv = canvas.parentElement; // Obtén el div externo
                        const parentPaddingRight = parseFloat(getComputedStyle(parentDiv).paddingRight);

                        // Ajusta el ancho del canvas al ancho del div externo
                        canvas.width = parentDiv.clientWidth - parentPaddingRight * 2;
                }

                // Ajusta inicialmente cuando se monta el componente
                adjustCanvasWidth();

                // // Agrega un listener de evento para el cambio de tamaño de la ventana
                // window.addEventListener('resize', adjustCanvasWidth);

                // // Limpia el listener de evento cuando se desmonta el componente
                // return () => {
                //         window.removeEventListener('resize', adjustCanvasWidth);
                // };
        }, [])

        const obtenerPuntosNoTransparentes = (imageData) => {
                const puntos = [];

                for (let y = 0; y < imageData.height; y++) {
                        for (let x = 0; x < imageData.width; x++) {
                                const index = (y * imageData.width + x) * 4; // índice en el array de datos

                                // Verificar si el píxel es no transparente (alfa > 0)
                                if (imageData.data[index + 3] > 0) {
                                        puntos.push({ x, y });
                                }
                        }
                }

                return puntos;
        };


        const onSubmit = async values => {
                // console.log('form data', values)

                if (undoHistoryRef.current.length === 0) {
                        setIsEmptyCanvas(true)
                } else {
                        setIsEmptyCanvas(false)
                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        context.canvas.willReadFrequently = true;

                        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                        context.canvas.willReadFrequently = false;

                        const puntosNoTransparentes = obtenerPuntosNoTransparentes(imageData);

                        // Aquí puedes realizar cualquier otra lógica con los puntos no transparentes
                        // console.log(puntosNoTransparentes);

                        values.canvas = { data: puntosNoTransparentes, width: canvas.width, height: canvas.height }

                        await axios.post("http://localhost:5000/save", values)
                }
        }

        //initial values
        const initialValues = {
                name: "",
                email: ""
        }

        const formik = useFormik({
                enableReinitialize: false,
                validateOnChange: true,
                initialValues,
                onSubmit,
                validate,
        })


        return <div className="form-style-5">
                <Row>Por favor llenar la siguiente informacion</Row>

                <form onSubmit={formik.handleSubmit}>
                        <Row>

                                <Col md={6} sm={6} xs={6}>
                                        <label htmlFor="name">Nombre<span style={{ color: "red" }}>*</span></label>
                                        <input type='text' id="name" name="name" onChange={formik.handleChange} ></input>
                                        {formik.errors.name && <div style={{ color: "red" }}>{formik.errors.name}</div>}
                                </Col>
                                <Col md={6} sm={6} xs={6}>
                                        <label htmlFor="email">Correo electronico<span style={{ color: "red" }}>*</span></label>
                                        <input type='text' id="email" name="email" onChange={formik.handleChange}></input>
                                        {formik.errors.email && <div style={{ color: "red" }}>{formik.errors.email}</div>}
                                </Col>

                        </Row>

                        <Row>
                                <Col>
                                        <canvas
                                                ref={canvasRef}
                                                onTouchStart={handleStart}
                                                onTouchMove={handleMove}
                                                onTouchEnd={handleEnd}
                                                onMouseDown={handleStart}
                                                onMouseMove={handleMove}
                                                onMouseUp={handleEnd}
                                                width="100%"
                                                height="500px"
                                                style={{ border: '1px solid #000', touchAction: 'none', backgroundColor: "white" }}
                                        />

                                        {isEmptyCanvas && <div style={{ color: "red" }}>Por favor realice un dibujo</div>}


                                        <div>
                                                <button type="button" onClick={handleClear}>Limpiar</button>
                                                <button type="button" onClick={handleUndo} disabled={isUndoDisabled}>Deshacer</button>
                                        </div>
                                </Col>
                        </Row>


                        <Row>
                                <Col>
                                        <button type="submit" className=''>Enviar</button>
                                </Col>
                        </Row>
                </form>
                <Row>

                </Row>
        </div>
};

export default CanvasComponent;
