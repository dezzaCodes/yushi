import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './about.css';
import desktopImage from '../../images/desktop.svg';
import laptopImage from '../../images/laptop.svg';
import Image from 'react-bootstrap/Image'
import riskImage from '../../images/risk.png';
import searchImage from '../../images/search.png';
import tradingImage from '../../images/trading.png'; 


export default function AboutPage() {
    return (
        <React.Fragment>
            <Container fluid>
            <Row className="title top-container" > 
                <Col></Col>
                <Col xs= {10}  className = "text-center">We Are YuShi</Col>
                <Col></Col>
            </Row>
            <Row className = "text top-container">
                <Col></Col>
                <Col xs={10} className="text-center"> 
                    <p> The online portfolio management system, designed to help the everyday investor 
                        design, plan and manage their portfolio to give them the edge over the market. 
                    </p>
                    </Col>
                <Col></Col>
            </Row>
            <Row className = "title mid-container">
                <Col></Col>
                <Col xs={10} className = "text-center">Simple investing for everyone</Col>
                <Col></Col>
            </Row>
            <Row className = "text mid-container">
                <Col></Col>
                <Col xs={10} className="text-center"> 
                    {/* <p>Since its inception in 1987, the Australian Stock Exchange has skyrocketed to 
                    become one of the largest exchange groups with an average daily turnover of AU$4.685 billion and a market cap of AU$1.9 trillion. </p>
                    <p>With such large sums of money being transacted on a daily basis, the market can be a difficult place for new investors to manoeuvre. 
                        In combination with the volatility of the market, where many external factors affect the performance of stocks and hence their evaluation , 
                        it can be intimidating knowing where to start for those without copious amounts of experience. </p> */}
                    <p>At YuShi, we understand that overwhelming feeling when you first set out to trade.
                        So we want to make it easier for the new investor to get started and grow their stock portfolio with 
                        three easy steps. </p>
                </Col>
                <Col></Col>
            </Row>
            <Row className = "text mid-container">
                <Col md ={3} className = "smallimg">
                    <Card className = "card1">
                        <Card.Img className = "cardImage" id = "search" variant = "top" src = {searchImage}/>
                        <Card.Body>
                            <Card.Title>Find Stocks</Card.Title>
                            <Card.Subtitle>Find stocks that fit your investment strategies using our stock screener and create a 
                                portfolio suited to you.
                            </Card.Subtitle>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md = {3} className = "smallimg">
                    <Card className = "card1">
                        <Card.Img className = "cardImage" id = "risk" variant = "top" src = {riskImage}/>
                        <Card.Body>
                            <Card.Title>Analyse Risk</Card.Title>
                            <Card.Subtitle>Analyse portfolio risk and expected shortfall with our analytical tools, so you can best
                                manage your portfolios.
                            </Card.Subtitle>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md = {3} className = "smallimg">
                    <Card className = "card1">
                        <Card.Img className = "cardImage" id = "trade" variant = "top" src = {tradingImage}/>
                        <Card.Body>
                            <Card.Title>Forecast</Card.Title>
                            <Card.Subtitle>Plan ahead with our stock price forecasting and make the most out of 
                                market opportunities. 
                            </Card.Subtitle>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row style = {{height: '6rem'}} className = "title top-container"> 
                <Col></Col>
                <Col xs = {10}>
                    How it works 
                </Col>
                <Col></Col>
            </Row>
            <Row className = "text top-container"> 
                <Col></Col>
                <Col xs = {5} className = "howTo">
                    <Row className = "subtitle first">
                        <Col>
                        <h3> We give you the analytical tools you need to design and manage your stock portfolio!</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        <h4 className = "subtitle">Find the stocks you're interested in</h4>
                        <p className = "sep">We help you find the stocks that suit your investment strategies</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        <h4 className = "subtitle">Create your portfolio </h4>
                        <p className = "sep">Add the stocks you want into your portfolio</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        <h4 className = "subtitle">Learn to grow your portfolio</h4>
                        <p className = "sep">Our portfolio tools and stock predictions help you negate risk and learn to expand your portfolio</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        <h4 className = "subtitle">Focus on what you do best</h4>
                        <p className = "sep">We take the hard work out of analysing the health of your portfolio, so you 
                            can focus on growing your investments
                        </p>
                        </Col>
                    </Row>
                </Col>
                <Col xs = {5}>
                    <img src = {laptopImage}/>
                </Col>
                <Col></Col>
            </Row>
            <Row>
            </Row>
        </Container>
        </React.Fragment>
    )
}