import React from 'react';
import TopGainers from './TopGainers';
import TopDeclines from './TopDeclines';
import TopCompanies from './TopCompanies';
import IndustryIndices from './IndustryIndices';
import { Grid } from '@material-ui/core';
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Spinner,
  Row,
  Col,
  // Button,
} from 'react-bootstrap';


export default function MarketPage() {
  return (
    <Container maxWidth="lg" className="anaysis-container">
      <Row className = "title">
        <h1 className="title analysis-container">Market Overview</h1>
      </Row>
      <Row className = "text">
        <Col><TopGainers /></Col>
        <Col><TopDeclines /></Col>
      </Row>
      <Row>
        <Col><IndustryIndices /></Col>
        <Col><TopCompanies /></Col>

      </Row>
      <br></br>

    </Container>
  );
}
