import React from 'react';
import StockScreener from './StockScreener';
import MonteCarlo from '../AnalysisPage/MonteCarlo'
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

export default function StockScreenerPage() {
  return (
    <Container>
      <Row>
        <Col></Col>
        <Col><h1> Stock Screener</h1></Col> 
        <Col></Col>
      </Row>
      <Row>
        <Col></Col>
        <Col><StockScreener /></Col>
        <Col></Col>
      </Row>
    </Container>
  );
}