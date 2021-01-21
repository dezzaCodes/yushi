import React, {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Container,
  Row,
  Col,
} from 'react-bootstrap';
import './page.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ErrorPage() {
    return (
        <React.Fragment>
            <Container maxWidth="lg" className="analysis-container">
            <Row className="title"> 
                <Col></Col>
                <Col xs= {8} className = "text-center">404 Page Not Found</Col>
                <Col></Col>
            </Row>
            <Row className = "text">
                <Col></Col>
                <Col xs={8}> <p className="text-center">We are sorry but the page you are looking for does not exist.</p></Col>
                <Col></Col>
            </Row>
            </Container>
        </React.Fragment>
    )
}