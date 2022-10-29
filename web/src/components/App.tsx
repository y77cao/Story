import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import styled from "styled-components";

import { updateAccountMetadata, connect, init } from "../redux/blockchainSlice";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import PopupModal, { modalState } from "./PopupModal";
import TextEditor from "./TextEditor";
import DesktopItem from "./DesktopItem";
import MenuItem from "./MenuItem";
import {
  clearAppError,
  closeWindow,
  openWindow,
  switchWindow,
  toggleAudio
} from "../redux/appSlice";
import WithdrawFund from "./WithdrawFund";
import { FAQ } from "./FAQ";

import etherscanIcon from "../../public/etherscan.png";
import githubIcon from "../../public/github.png";
import twitterIcon from "../../public/twitter.png";
import volumeIcon from "../../public/volume.png";
import muteIcon from "../../public/mute.png";

export enum WindowType {
  STORY,
  WITHDRAW_FUND,
  FAQ
}

function App() {
  const dispatch = useDispatch();
  // @ts-ignore
  const blockchain = useSelector(state => state.blockchain);
  // @ts-ignore
  const app = useSelector(state => state.app);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(init());

    // @ts-ignore checked in init
    const { ethereum } = window;
    ethereum.on("accountsChanged", accounts =>
      dispatch(updateAccountMetadata(accounts[0]))
    );
    ethereum.on("chainChanged", chainId => {
      window.location.reload();
      dispatch(init());
    });
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderStoryItems = () => {
    return Object.entries(blockchain.stories).map(([parentId, tokens]) => {
      return (
        <DesktopItem
          title={`${tokens[0].title}.txt`}
          parentId={parentId}
          onClickItem={() => {
            dispatch(
              openWindow({
                window: {
                  id: parentId,
                  type: WindowType.STORY,
                  name: `${tokens[0].title}.txt`,
                  metadata: {
                    title: tokens[0].title,
                    parentId
                  }
                }
              })
            );
          }}
          key={tokens[0].title}
        />
      );
    });
  };

  const renderMenu = () => {
    if (!menuVisible) return null;
    return (
      <MenuWrapper>
        {blockchain.canMintWithTitle ? (
          <MenuItem
            onClickItem={() => {
              dispatch(
                openWindow({
                  window: {
                    id: "new-story",
                    name: "untitled.txt",
                    type: WindowType.STORY,
                    metadata: {
                      title: "untitled.txt",
                      parentId: -1
                    }
                  }
                })
              );
              toggleMenu();
            }}
            text="New Story"
          />
        ) : null}
        <MenuItem
          onClickItem={() => {
            dispatch(
              openWindow({
                window: {
                  id: "withdraw-fund",
                  name: "Check Balance / Withdraw Fund",
                  type: WindowType.WITHDRAW_FUND,
                  metadata: {}
                }
              })
            );
            toggleMenu();
          }}
          text="Check Balance / Withdraw Fund"
        />
        <MenuItem
          onClickItem={() => {
            if (!blockchain.account) dispatch(connect());
          }}
          text={blockchain.account ? blockchain.account : "Login"}
        />
      </MenuWrapper>
    );
  };

  const renderWindows = () => {
    return app.windows.map(window => {
      switch (window.type) {
        case WindowType.STORY:
          const {
            metadata: { title, parentId }
          } = window;
          return (
            <TextEditor
              id={window.id}
              title={title}
              parentId={parentId}
              onClose={() => dispatch(closeWindow({ windowId: window.id }))}
            ></TextEditor>
          );

        case WindowType.WITHDRAW_FUND:
          return (
            <WithdrawFund
              onClose={() => dispatch(closeWindow({ windowId: window.id }))}
            />
          );
        case WindowType.FAQ:
          return (
            <FAQ
              id={window.id}
              onClose={() => dispatch(closeWindow({ windowId: window.id }))}
            ></FAQ>
          );
      }
    });
  };

  const renderBottomIcons = () => {
    return (
      <IconsContainer>
        <div
          onClick={() => dispatch(toggleAudio())}
          style={{ cursor: "pointer" }}
        >
          {app.audioEnabled ? (
            <Image src={volumeIcon}></Image>
          ) : (
            <Image src={muteIcon}></Image>
          )}
        </div>
        <a href="https://github.com/y77cao/Story" target="_blank">
          <Image src={githubIcon}></Image>
        </a>
        <a
          href="https://goerli.etherscan.io/address/0xc9fe9e9101da9ca8a7ae961671eaa85860e5e353"
          target="_blank"
        >
          <Image src={etherscanIcon}></Image>
        </a>
        <a href="https://twitter.com/0xdcmini" target="_blank">
          <Image src={twitterIcon}></Image>
        </a>
      </IconsContainer>
    );
  };

  const renderTabs = () => {
    return app.tabs.map(tab => (
      <Tab
        id={tab.id}
        onClick={() => dispatch(switchWindow({ windowId: tab.id }))}
      >
        {tab.name}
      </Tab>
    ));
  };

  return (
    <DesktopContainer>
      <DesktopInnerContainer onClick={() => setMenuVisible(false)}>
        <DesktopItemList>
          <DesktopItem
            title={"FAQ.txt"}
            parentId={-1}
            onClickItem={() => {
              dispatch(
                openWindow({
                  window: {
                    id: "faq",
                    name: "FAQ.txt",
                    type: WindowType.FAQ,
                    metadata: {}
                  }
                })
              );
            }}
          />
          {blockchain.stories && renderStoryItems()}
        </DesktopItemList>
        {renderWindows()}
        {app.errorMsg ? (
          <PopupModal
            state={modalState.ERROR}
            message={app.errorMsg}
            onClose={() => dispatch(clearAppError())}
            onOk={() => dispatch(clearAppError())}
          />
        ) : null}
      </DesktopInnerContainer>
      <BottomWrapper>
        {renderMenu()}
        <BarWrapper>
          <StartButton onClick={toggleMenu}>Start</StartButton>
          {renderBottomIcons()}
          {renderTabs()}
        </BarWrapper>
      </BottomWrapper>
    </DesktopContainer>
  );
}

export const StartButton = styled(StyledButton)`
  padding: 5px 15px;
`;

export const Tab = styled(StyledContainer)`
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
  background-color: pink;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 100%;
  background-image: url("/story-desktop.jpeg");
  background-repeat: no-repeat;
  background-size: cover;
`;

const DesktopInnerContainer = styled.div`
  flex-grow: 1;
`;

const MenuWrapper = styled.div`
  width: 380px;
  background-color: lightgrey;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
  box-shadow: inset 1px 1px #dfdfdf, 1px 0 #000, 0 1px #000, 1px 1px #000;
  position: relative;
  z-index: 99;
`;

const IconsContainer = styled.div`
  > * {
    padding: 0 5px;
  }
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default App;
