import React, { Component } from 'react';
import '../../style/imgFigure.css';

class ImgFigure extends Component {
  componentDidMount(){

  }



  render() {
    let arr = [];
    let imgContent0 = <img key={"0"} style={this.props.arrange[0]} src={[require("../../images/0.jpg")]} alt="" />;
    let imgContent1 = <img key={"1"} style={this.props.arrange[1]} src={[require("../../images/1.jpg")]} alt="" />;
    let imgContent2 = <img key={"2"} style={this.props.arrange[2]} src={[require("../../images/2.jpg")]} alt="" />;
    arr.push(imgContent0);
    arr.push(imgContent1);
    arr.push(imgContent2);
    return (
      <div className="imgs">{arr}</div>
    );
  }
}

export default ImgFigure;
