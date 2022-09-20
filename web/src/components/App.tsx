import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { updateAccount, initSuccess } from "../redux/blockchainSlice";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import styled from "styled-components";
import { Menu } from "./Menu";
import { ErrorModal } from "./ErrorModal";
import TextEditor from "./TextEditor";
import { ContractClient } from "../clients/contractClient";
import { DesktopItem } from "./DesktopItem";
import { toStories } from "../utils";

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector(state => state.blockchain);
  const app = useSelector(state => state.app);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeStory, setActiveStory] = useState(null);
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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // const estimatedMintCost = (): string => {
  //   return ethers.utils.formatUnits(
  //     (BigInt(input.length) * BigInt(blockchain.pricePerChar)).toString()
  //   );
  // };

  const renderStoryItems = () => {
    return Object.entries(blockchain.stories).map(([parentId, tokens]) => {
      return (
        <DesktopItem
          title={`${tokens[0].title}.txt`}
          parentId={parentId}
          onClick={e => {
            e.preventDefault();
            setActiveStory({ title: tokens[0].title, parentId });
          }}
          key={tokens[0].title}
        />
      );
    });
  };

  return (
    <DesktopContainer>
      <DesktopItemList>
        <DesktopItem title={"about.txt"} parentId={-1} onClick={() => {}} />
        {blockchain.stories ? renderStoryItems() : null}
      </DesktopItemList>
      {activeStory ? (
        <TextEditor
          title={activeStory.title}
          parentId={activeStory.parentId}
          setActiveStory={setActiveStory}
        ></TextEditor>
      ) : null}
      <BottomWrapper>
        {menuVisible ? <Menu /> : null}
        <BarWrapper>
          <StartButton
            onClick={e => {
              e.preventDefault();
              toggleMenu();
            }}
          >
            Start
          </StartButton>
          {blockchain.account ? (
            <TabWrapper>{blockchain.account}</TabWrapper>
          ) : null}
        </BarWrapper>
      </BottomWrapper>
      {displayedError.length ? (
        <ErrorModal
          message={displayedError}
          setDisplayedError={setDisplayedError}
        />
      ) : null}
    </DesktopContainer>
  );
}

export const StartButton = styled(StyledButton)`
  padding: 5px 15px;
  margin-right: 10px;
`;

export const TabWrapper = styled(StyledContainer)`
  padding: 5px 15px;
  cursor: pointer;
  &:hover {
    box-shadow: inset 1px 1px 2px 0px #1b1b1b, 5px 5px 15px 5px rgba(0, 0, 0, 0);
  }
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: black;
`;

const BottomWrapper = styled.div`
  width: 100%;
  height: auto;
  margin-top: auto;
`;

const BarWrapper = styled(StyledContainer)`
  width: 100%;
  height: auto;
  display: flex;
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
