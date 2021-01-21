import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {InputLabel, Input, CircularProgress, FormControl, Grid, Snackbar, IconButton } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Candle from "./candle.PNG"
import './neural.css';
import Arrow from "./arrow.gif"
import CNNimg from "./cnn.png"
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import CloseIcon from '@material-ui/icons/Close';

export default function NeuralNet() {
  const [stockCode, setStockCode] = useState('');
  const [code, setCode] = useState('');
  

  const [isFetching, setIsFetching] = useState(false);
  const [data, setData] = useState(null)

  // ERRORS 
  const [snackBarError, setSnackBarError] = useState(null);
  const [open, setOpen] = useState(false);
  const [fetchingError, setFetchingError] = useState(null)
  
  const handleSubmit = (e) => {
    e.preventDefault();

    setIsFetching(true);
    setFetchingError(null);
    setSnackBarError(null);
    setData(null);

    axios.post('/analytics/predict', {
      code: stockCode
    })
    .then(res => fetchSuccess(res.data)).catch((err)=>fetchError(err));
  };

  const fetchSuccess = (data) => {
    setIsFetching(false);
    setFetchingError(null);
    setSnackBarError(null)
    setData(data);
    setCode(stockCode);
  }

  const fetchError = (error) => {
    setIsFetching(false);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(fetchingError)
      if (error.response.status === 422){
        // Snackbar error because it to do with form
        setSnackBarError(
          `${error.response.status} Error: ${error.response.data}`
        );
        setOpen(true);
      } else {
        setFetchingError(
          `${error.response.status} Error: ${error.response.data}`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      setFetchingError('Request was made but no response was received.');
    } else {
      // Something happened in setting up the request that triggered an Error
      setFetchingError(error.message);
    }
  }
  const handleSnackBarClose = () => {
    setOpen(false);
    setSnackBarError(null);
  };


  return (
    <React.Fragment>
      <Container maxWidth="lg" className="analysis-container">
      <Row className="title"> 
          <Col></Col>
          <Col>Neural Net</Col>
          <Col></Col>
      </Row>
      <Row className = "text">
          Candlestick charts are known to give valuable information about share market trends. <br></br>
          Previous studies have found the usage of candlestick charts as input to convolutional neural networks to be effective to detect trends and patterns, especially in predicting short term trends. <br></br>
          With this in mind we created a dataset by converting historical ASX50 data (2005-2018) into candlestick charts of 20-day periods. We trained the CNN on these images (146,431 in total) and tested it on historical dat from 2018-2020.  
          <br></br>
          The output of the neural network predicts if a stock will go up (open less than close) or down (open more than close) the next day.
          <br></br>
          While the prediction accepts input of any ASX stock, please note it was trained and tested on only the ASX50 companies and so accuracy may differ. 
      </Row>
      <br></br>
      <Row className = "subtitle">
          <Col> Input: </Col>
          <Col xs = {6}> Neural Net:</Col>
          <Col> Output:</Col>
      </Row>
      <Row className="midRow">
          <Col><img src = {Candle} className="img"/></Col>
          <Col xs = {6}><img src = {CNNimg} className="img"/></Col>
          <Col><img src = {Arrow} className="img"/> </Col>
      </Row>
      <Row className = "subtitle">
          <Col> 3x50x50 candlestick charts </Col>
          <Col xs = {6}> Conv2d(8)maxpool -> Conv2d(16)maxpool -> Conv2d(32)maxpool -> Conv2d(64)maxpool -> flatten -> Linear(1)</Col>
          <Col> Will the stock go up or down?</Col>
      </Row>
      <br></br>
      <Row className="text">
      <Col></Col>
        <Col xs = {6}>Enter the stock below which will be inputted into the neural net:</Col>
        <Col></Col>
      </Row>
      <br></br>
      <Row>
        <Col></Col>
        <Col xs={6}>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="stock-code-label">Stock Code</InputLabel>
              <Input
                required
                placeholder="ex. ASX"
                value={stockCode}
                input type = "text"
                onChange= {(e) => setStockCode(e.target.value.toUpperCase())}
                inputProps={{
                  'aria-label': 'stock-code-input',
                  maxlength: 3,
                  minlength: 3,
                }}
              />
              <br></br>

            </FormControl>
            <div className="container-fluid button-container">

            <Button type="submit" variant="outline-primary">Predict</Button>
            </div>

          </form>
          </Col>
          <Col></Col>
        </Row>
        <br></br>
        </Container>

        {data && !isFetching && !fetchingError &&(
          <Container maxWidth="md" style={{ margin: '40px auto' }} justify="center">
            <React.Fragment>
              <Row className="pred">
              <Col></Col>
              <Col xs = {6}>{code} Prediction Results</Col>
              <Col></Col>
              </Row>
              <Row className="pred2">
                <Col></Col>
              <Col xs = {4}>Will the stock go up or down tomorrow?{data.prediction === 0 ? <Col className="no">Down</Col> : <Col className="yes">Up</Col> }</Col>
              <Col xs ={4}>Percentage probability: <Col>{data.output.toFixed(3)}%</Col></Col>
              <Col></Col>
              </Row>
            </React.Fragment>
          </Container>
        )}
        
        {isFetching && <CircularProgress />}
                
        {/* Displaying any errors that occurred */}
        {snackBarError && (
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={open}
            autoHideDuration={5000}
            onClose={handleSnackBarClose}
            message={snackBarError}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackBarClose}
              >
              <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        )}

        {fetchingError && <Alert severity = "error">{fetchingError}</Alert>}

       
    </React.Fragment>
  )
}

