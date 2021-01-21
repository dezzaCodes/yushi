import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Card, Tabs, Tab, Col, Row,Container } from "react-bootstrap";
import PropTypes from "prop-types";

import RegisterForm from "./RegisterForm";
import { register } from "../../actions/auth";

import "../loginPage/login.css";

function RegisterPage(props) {
  if (props.isAuthenticated) return <Redirect to="/homepage" />;
  

  const tabOneDone = info => {
    props.register(info['email'],info['password']);
  };

  return (
    <React.Fragment>
      <Container fluid className = "login-container">
        <Row>
        <Col md = {8} className = "left-login">

      <h1 className = "left-title">YuShi </h1>
      <div className = "left-text">
      <h4 style ={{fontWeight:'bold'}} > Make it easy to track your shares </h4>
      <h4>Best analytics </h4>
      <h4>Easy to use web browser </h4>
      <h4>Free registration </h4>
      </div>
      
      </Col>
      <Col md = {4} className = "login-box">
        <Card>
        <Card.Body>
          <Card.Title className="login-title">YuShi</Card.Title>
          <Card.Text className="login-text">
          <h4 style = {{fontWeight:'bold'}}>Sign up</h4>
          <h6>Create a Yushi account </h6 >
          </Card.Text>
          <RegisterForm onSubmit ={tabOneDone} />
          <Card.Text className = "login-text">
          <h6>Already have an account? <Link to="/login">Login</Link></h6>
        </Card.Text>
        </Card.Body>
      </Card>
      </Col>
      </Row>
      </Container>

    </React.Fragment>
    );

}

RegisterPage.propTypes = {
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { register })(RegisterPage);
