import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { Button, Form ,Card, Container, Row, Col} from "react-bootstrap";
import PropTypes from "prop-types";
import { useStore } from 'react-redux';
import axios from 'axios';
import "../loginPage/login.css";

function PassChance(props) {
  const [newPass, setNewPass] = React.useState('');
  const [newPass1,setNewPass1] = React.useState('');
  const [error, setError] = useState(null);
  const userId = useStore().getState().auth.id;
  

    const handleSubmit = e => {
      if (newPass !== newPass1) {
        setError("Passwords don't match.");
      }else{
        const body = JSON.stringify({userId,newPass});  
        axios
        .post(`/api/passChange`,body,getConfig())
        .then(res =>{
          window.alert(res.data.msg);
          setError();
        })
        .catch(err => {
          console.log(err)
        });
        return <Redirect to="/homepage"/>;
      }
      e.preventDefault();
    };

    return (
      <React.Fragment>
        <Container fluid className = "login-container">
          <Row>
            <Col md = {8} className = "left-login">
            <h1 className = "left-title">YuShi </h1>

            </Col>
            <Col md = {4} className="login-box">
        {/* <Card style = {{width:'35rem',height:'36rem',left:'54.5rem',top:'1rem'}}> */}
        <Card>
        <Card.Body>
          <h1 style={{color:'rgb(244,128,55)',textAlign:'center'}}> YuShi </h1>
          <h4 style={{fontWeight:'bold',textAlign:'center'}}>Password Change</h4>
          <h6 style={{textAlign:'center'}}> Change your YuShi password</h6 >
          <Form onSubmit={handleSubmit} > 
          <Form.Group >
            <h5>Password</h5>
            <Form.Control
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              required
            />
          </Form.Group>

            <Form.Group>
              <h5>Confirm Password</h5>
              <Form.Control
                type="password"
                value={newPass1}
                onChange={e => setNewPass1(e.target.value)}
                required
              />
            </Form.Group>

            {error && <p className="text-center text-danger">{error}</p>}
            <div className = "form">
            <Button type="submit" variant="primary" block style={{borderRadius:'10px',border:'none',width:'50%',height:'100%',padding:'5%',background:'rgb(0, 156, 222)'}}>
            Change
            </Button>
            </div>
          </Form>

        </Card.Body>
      </Card>
      </Col>
      </Row>
      </Container>
      </React.Fragment>
  
    );
  }

  export const getConfig = getState => {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (!getState) return config;
  
    // get the token from authentication state
    const token = getState().auth.token;
  
    // Add the authorization header if token exists
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  };
  
  PassChance.propTypes = {
    isAuthenticated: PropTypes.bool
  };
  

  
  export default connect()(PassChance);
  