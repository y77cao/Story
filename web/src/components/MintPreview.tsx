import React, { useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { updateImageUrl } from "../redux/appSlice";

const MintPreview = props => {
  const canvasRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "#000000";
    context.fillText(props.content, 10, 50);
    dispatch(updateImageUrl({ imageUrl: canvas.toDataURL("image/png") }));
  }, []);

  return <canvas ref={canvasRef} />;
};

const mapStateToProps = state => {
  return {
    account: state.blockchain.account,
    content: state.app.content
  };
};

export default connect(mapStateToProps)(MintPreview);
