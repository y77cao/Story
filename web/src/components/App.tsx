import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateAccount, initSuccess } from "../redux/blockchainSlice";
import * as s from "../styles/globalStyles";
import styled from "styled-components";
import { MintConfirmation } from "./MintConfirmation";
import { Menu } from "./Menu";
import { ContractClient } from "../clients/contractClient";
import { DesktopItem } from "./DesktopItem";
import { toStories } from "../utils";

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector(state => state.blockchain);
  const app = useSelector(state => state.app);
  const [mintConfirmationVisible, setMintConfirmationVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [displayedError, setDisplayedError] = useState("");

  useEffect(() => {
    setDisplayedError(blockchain.errorMsg);
  }, [blockchain.errorMsg]);

  useEffect(() => {
    setDisplayedError(app.errorMsg);
  }, [app.errorMsg]);

  useEffect(() => {
    const initContract = async () => {
      try {
        // @ts-ignore checked in initContract
        const { ethereum } = window;
        const { provider, contract } = await ContractClient.initContract();
        const contractClient = new ContractClient(provider, contract);

        const pricePerChar = (
          await contractClient.getPricePerChar()
        ).toString();
        const tokens = await contractClient.getAllTokens();
        const stories = toStories(tokens);
        dispatch(initSuccess({ contractClient, stories, pricePerChar }));

        ethereum.on("accountsChanged", accounts => {
          dispatch(updateAccount({ account: accounts[0] }));
        });
        ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (err) {
        setDisplayedError(err.message);
      }
    };

    initContract();
  }, []);

  // const toggleMintConfirmationVisible = () => {
  //   setMintConfirmationVisible(!mintConfirmationVisible);
  // };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // const estimatedMintCost = (): string => {
  //   return ethers.utils.formatUnits(
  //     (BigInt(input.length) * BigInt(blockchain.pricePerChar)).toString()
  //   );
  // };

  const renderStoryItems = () => {
    return Object.values(blockchain.stories).map(tokens => {
      return (
        <DesktopItem title={`${tokens[0].title}.txt`} onClick={() => {}} />
      );
    });
  };

  return (
    <DesktopContainer>
      <DesktopItemList>
        <DesktopItem title={"about.txt"} onClick={() => {}} />
        {blockchain.stories ? renderStoryItems() : null}
      </DesktopItemList>
      <BottomBarWrapper>
        {menuVisible ? <Menu /> : null}
        <StartButtonWrapper>
          <StartButton
            onClick={e => {
              e.preventDefault();
              toggleMenu();
            }}
          >
            Start
          </StartButton>
        </StartButtonWrapper>
      </BottomBarWrapper>
      <div>{blockchain.account ? blockchain.account : null}</div>
      {displayedError ? <div>{displayedError}</div> : null}
    </DesktopContainer>
  );
}

export const StartButton = styled.button`
  background-color: lightgrey;
  color: white;
  padding: 5px 15px;
  outline: 0;
  cursor: pointer;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
  box-shadow: inset 1px 1px #dfdfdf, 1px 0 #000, 0 1px #000, 1px 1px #000;
  transition: ease background-color 250ms;
  &:hover {
    box-shadow: inset 1px 1px 2px 0px #1b1b1b, 5px 5px 15px 5px rgba(0, 0, 0, 0);
  }
  color: black;
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;

const BottomBarWrapper = styled.div`
  width: 100%;
  height: auto;
  margin-top: auto;
`;

const StartButtonWrapper = styled.div`
  width: 100%;
  height: auto;
  background-color: lightgrey;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
  box-shadow: inset 1px 1px #dfdfdf, 1px 0 #000, 0 1px #000, 1px 1px #000;
`;

const DesktopItemList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const DesktopContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 100%;
  height: 100vh;
  width: 100vw;
`;

export default App;
