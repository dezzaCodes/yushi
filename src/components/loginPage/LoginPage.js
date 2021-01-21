import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import PropTypes from "prop-types";

import LoginForm from "./LoginForm";

import "./login.css";

function LoginPage(props) {
  if (props.isAuthenticated) {
    return <Redirect to="/homepage" />;
  }
  if(props.error.msg === "LOGIN_FAILURE"){
    if( document.getElementById("error") != null){
      document.getElementById("error").innerHTML="Invalid account or password. Please try again"
    }
  }

  return (
    <React.Fragment>
      <Container fluid className = "login-container">
        <Row>
        <Col md = {8} className = "left-login">

      <h1 className = "left-title">YuShi </h1>
      <div className = "left-text">
      <h4 style ={{fontWeight:'bold'}} > Login to access your portfolios </h4>
      </div>
      </Col>
      <Col md = {4} className = "login-box">
        <Card>
        <Card.Body>
          <Card.Title className="login-title">YuShi</Card.Title>
          <Card.Text className="login-text">
          <h4 style = {{fontWeight:'bold'}}>Login</h4>
          <h6>Sign in to your YuShi account </h6 >
          </Card.Text>
          <LoginForm />
          <Card.Text className = "login-text">
          <h6>Don't have an account? <Link to="/register">Register</Link></h6>
        </Card.Text>
        </Card.Body>
      </Card>

    </Col>
    </Row>

    </Container>
    </React.Fragment>

  );
}

LoginPage.propTypes = {
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  error: state.errors
});

export default connect(mapStateToProps)(LoginPage);
