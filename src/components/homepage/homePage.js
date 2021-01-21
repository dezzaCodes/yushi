import React from 'react';
import { Container, Button, Row, Col, Carousel, Card } from 'react-bootstrap';

import Image1 from '../../images/1.jpg';
import Image2 from '../../images/2.jpg';
import Image3 from '../../images/0.jpg';
import SideImage from './sideimg.jpg';

import './home.css';

export default function homePage() {
  return (
    <React.Fragment>
      <Container fluid>
        <Row>
          <Col md={9} className="c">
            <Carousel interval = "5000" pause = "hover">
              <Carousel.Item>
                <img className="d-block w-100" src={Image1} alt="First slide" />
                <Carousel.Caption>
                  <h3 className="carousel-text">Plan your shares</h3>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src={Image2} alt="Third slide" />
                <Carousel.Caption>
                  <h3 className="carousel-text">Invest in your future</h3>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img className="d-block w-100" src={Image3} alt="Third slide" />
                <Carousel.Caption>
                  <h3 className="carousel-text">
                    Analyse and predict stock market trends
                  </h3>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          </Col>

          <Col md={3} className="side-banner">
            <div className="side-banner-title">Yushi</div>
            <div className="side-banner">
              Create a portfolio
              <br></br>Analyse trends
              <br></br>Earn money
            </div>
            <Button variant="primary" href="/register">
              Find out more
            </Button>{' '}
          </Col>
        </Row>
        <Row>
          <Col md={12} className="text-banner">
            <div className="text-banner-title"> We offer </div>
            <div className="text-banner-text">Analytics and Predictions</div>
          </Col>
        </Row>
        <Row>
          <Col md={4}></Col>

          <Col md={4} className="bottom-text">
            <div className="bottom-text-title">Get started</div>
          </Col>
          <Col md={4}></Col>
        </Row>

        <Row className="imgrow">
          <Col md={3} className="smallimg">
            <div>
              <Card
                style={{ width: '18rem', height: '13rem' }}
                className="card1"
              >
                <Card.Body>
                  <Card.Title>Search up stocks</Card.Title>
                  <Card.Text>
                    Click the below link to start viewing stocks now
                  </Card.Text>
                  <Card.Link href="/stock">View ></Card.Link>
                </Card.Body>
              </Card>
            </div>
            <br></br>
            <div>
              <Card
                style={{ width: '18rem', height: '13rem' }}
                className="card3"
              >
                <Card.Body>
                  <Card.Title>Game</Card.Title>
                  <Card.Text>
                    Compete against others on the Yushi server
                  </Card.Text>
                  <Card.Link href="/game">Game ></Card.Link>
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col md={3} className="smallimg">
            <div>
              <Card style={{ width: '18rem', height: '13rem' }}>
                <Card.Body>
                  <Card.Title>Start your portfolio</Card.Title>
                  <Card.Text>
                    Simply register or log in to start building your own
                    portfolios
                  </Card.Text>
                  <Card.Link href="/login">Login ></Card.Link>
                </Card.Body>
              </Card>
            </div>
            <br></br>
            <div>
              <Card
                style={{ width: '18rem', height: '13rem' }}
                className="card2"
              >
                <Card.Body>
                  <Card.Title>Analytics</Card.Title>
                  <Card.Text>
                    We provide various algorithms and techniques to analyse
                    share market trends.
                  </Card.Text>
                  <Card.Link href="/analytics/predict">Analytics ></Card.Link>
                </Card.Body>
              </Card>
            </div>
          </Col>

          <Col md={3} className="smallimg">
            <Card style={{ height: '28rem' }}>
              <Card.Img variant="top" src={SideImage} />
              <Card.Body>
                <Card.Title>Invest</Card.Title>
                <Card.Text>Registration is free. Start investing now</Card.Text>
                <Button variant="outline-secondary" href="/register">
                  Register
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <br></br>
        <br></br>

        {/* <Row>
        <Col md = {12}> <ImgSlides imageDatas={imageDatas}/>    
        <img key={"0"} src={[require("../../images/3.jpg")]} alt=""/> 
        </Col>
      </Row>
      
      <Row className="text-banner">
      
        <Col md = {12}> 
        We Offer
        <br></br> 
        Analytics and Predictions 
        </Col>
      </Row> */}

        {/* <Row> 

        <Col md={12} className="subtitle">      
      </Col>
      </Row>
      <p style={{  position: 'absolute',top: '80px',right: '5%',color:'rgb(99,102,106)',opacity: '0.9',fontSize:'40px'}} className="title">
        Yushi        
      </p>
      <p style={{  position: 'absolute',top: '180px',right: '5%',color:'rgb(99,102,106)',opacity: '0.9',fontSize:'20px'}}>
        Create a portfolio       
      </p>
      <p style={{  position: 'absolute',top: '220px',right: '5%',color:'rgb(99,102,106)',opacity: '0.9',fontSize:'20px'}}>
        Analyse trends       
      </p>
      <p style={{  position: 'absolute',top: '260px',right: '5%',color:'rgb(99,102,106)',opacity: '0.9',fontSize:'20px'}}>
        Earn money    
      </p>
    <div className="subtitle" align = "center" style={{width:'100%',height:'13%',bottom:'0rem',position:'absolute',background:'rgb(244,128,55)', opacity: '0.85',color:'rgb(0,0,0)'}}>
      <h1 style={{fontSize:'30px'}}>We offer</h1>
      <p sytle={{fontSize:'20px',height:'40%',position:'relative'}}>Accurate data and analytics</p>
    </div>
*/}
      </Container>
    </React.Fragment>
  );
}
