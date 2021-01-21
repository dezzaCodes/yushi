import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

import { login } from "../../actions/auth";
import "./login.css"

function LoginForm(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const style = {
      width:'100%',
      height:'100%',
      padding:'5%',
    }


    const handleSubmit = e => {
      e.preventDefault();
      props.login(email, password);
      return;
    };
  
    return (
      
      <React.Fragment>
    <div>
      <Form onSubmit={handleSubmit} style = {style} className = "form-top"> 
        <Form.Group>
          <h5>Email</h5>
          <Form.Control
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            stle
            required
          />
        </Form.Group>
        <Form.Group>
            <h5>Password</h5>
          <Form.Control
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            required
          />
          
        </Form.Group>

        <div id="error" className="text-center text-danger"></div>

        <div className="form" style={{postion:"absolute"}}>
        <Button type="submit" variant="primary" block style={{borderRadius:'10px',border:'none',width:'50%', height:'100%',padding:'5%',background:'rgb(0, 156, 222)',marginTop:'15px',postion:"relative"}}>
          Sign In
        </Button>
        </div>
      </Form>
      </div>


      </React.Fragment>
    );
  }
  
  LoginForm.propTypes = {
    login: PropTypes.func.isRequired
  };

  
  
  export default connect(
    null,
    { login }
  )(LoginForm);
  