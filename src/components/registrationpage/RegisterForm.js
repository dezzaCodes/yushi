import React, { useState } from "react";
import { Button, Form, Col, Row } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import Proptypes from "prop-types";
import { connect } from "react-redux";

import "../loginPage/login.css"

function RegisterForm(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const style = {
    width:'100%',
    height:'100%',
    padding:'5%',
  }

  const wordsBackGround = {
    position:'absolute',
    visibility: 'visible',
    opacity: '0.75',
    width:'35rem',
    height:'40rem',
    top:'0px',
    right:'0px'
  }

  if(props.error == "REGISTER_FAILURE"){
    document.getElementById("registerError").innerHTML="user exists."
  }

  const handleSubmit = e => {
    e.preventDefault();

    if (password !== password2) {
      document.getElementById("registerError").innerHTML="Passwords don't match."
      return;
    }

    const userInfo = {email, password};
    props.onSubmit(userInfo);
  };

  return (
    <React.Fragment>
      <div>
    <Form onSubmit={handleSubmit} style = {style} className = "form-top">

      <Form.Group >
        <h5>Email</h5>
        <Form.Control
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group >
        <h5>Password</h5>
        <Form.Control
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </Form.Group>

        <Form.Group>
          <h5>Confirm Password</h5>
          <Form.Control
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />
        </Form.Group>

     <p id = "registerError" className="text-center text-danger">{}</p>

        <div className = "form">
        <Button type="submit" variant="primary" block style={{borderRadius:'10px',border:'none',width:'50%',height:'100%',padding:'5%', background:'rgb(0, 156, 222)'}}>
          Register
        </Button>
        </div>

        </Form>

        </div>


    </React.Fragment>

    

    
  );
}

RegisterForm.propTypes = {
  onSubmit: Proptypes.func.isRequired
};
const mapStateToProps = state => ({
   error:state.errors.msg
});
export default connect(mapStateToProps)(RegisterForm);

