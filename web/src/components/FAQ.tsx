import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import TextEditor from "./TextEditor";
import { closeWindow } from "../redux/appSlice";

export const FAQ = ({ id, onClose }) => {
  return (
    <TextEditor
      id={id}
      title="FAQ"
      parentId={-1}
      onClose={onClose}
      editable={false}
    >
      <FAQContainer>
        <div>
          <strong>What’s this?</strong>
        </div>
        <div>
          Story is a{" "}
          <span style={{ textDecoration: "line-through" }}>ponzi</span>{" "}
          collaborative writing project on Base. Anyone can decide how the story
          proceeds by writing more to it. Each text snippet you chose wrote to
          the story will be minted as an NFT. All mint cost will be rewarded to
          all previous writers.
        </div>
        <div>
          <strong>How does it work?</strong>
        </div>
        <div>
          Click on Start &gt; Login to connect your wallet. Choose a story that
          you'd like to keep writing and start typing. Once ready, click on the
          save button on the top right to mint.
        </div>
        <div>
          <strong>How much does it cost?</strong>
        </div>
        <div>Mint price is 0.00005 ether per character + gas.</div>
        <div>
          <strong>Can I start my own story?</strong>
        </div>
        <div>
          Definitely. But you need to practice some writing in the existing
          stories by writing at least 3 snippets first.
        </div>
        <div>
          <strong>How are the rewards distributed?</strong>
        </div>
        <div>
          Rewards are divided on a per-token basis. The mint cost of the current
          token will be distributed evenly to all previous tokens that have been
          minted before it. You can check and withdraw the rewards in Start &gt;
          Check Balance / Withdraw Fund.
        </div>
        <div>
          <strong>Who’s the creator?</strong>
        </div>
        <div>
          <a href="https://twitter.com/y77cao" target="_blank">
            y77cao
          </a>{" "}
          it is! Say hi:)
        </div>
      </FAQContainer>
    </TextEditor>
  );
};

const FAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  > div {
    padding: 10px 0;
  }
`;
