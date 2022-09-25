import React, { useState } from "react";
import styled from "styled-components";

export const TextWithTooltip = ({ textMetadata }) => {
  const [hover, setHover] = useState(false);
  return (
    <StyledSpan
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {textMetadata.text}
      <Tooltip hover={hover}>Creator: {textMetadata.creator}</Tooltip>
    </StyledSpan>
  );
};

const StyledSpan = styled.span`
  position: relative;
  &:hover {
    background-color: yellow;
  }
`;

const Tooltip = styled.span`
  display: ${props => (props.hover ? "block" : "none")};
  position: absolute;
  left: 0;
  bottom: 20px;
  background-color: white;
`;
