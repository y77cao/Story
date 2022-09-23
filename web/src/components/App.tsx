import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import styled from "styled-components";

import {
  updateAccount,
  initSuccess,
  fetchData,
  connect
} from "../redux/blockchainSlice";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import { Menu } from "./Menu";
import { PopupModal, modalState } from "./PopupModal";
import TextEditor from "./TextEditor";
import { ContractClient } from "../clients/contractClient";
import { DesktopItem } from "./DesktopItem";
import {
  appError,
  clearAppError,
  closeWindow,
  openWindow
} from "../redux/appSlice";
import arrow from "../../public/arrow.png";
import WithdrawFund from "./WithdrawFund";

export enum WindowType {
  STORY,
  WITHDRAW_FUND,
  MANUAL
}

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector(state => state.blockchain);
  const app = useSelector(state => state.app);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      try {
        // @ts-ignore checked in initContract
        const { ethereum } = window;
        const { provider, contract } = await ContractClient.initContract();
        const contractClient = new ContractClient(provider, contract);

        dispatch(initSuccess({ contractClient }));
        dispatch(fetchData());
        ethereum.on("accountsChanged", accounts => {
          dispatch(updateAccount({ account: accounts[0] }));
        });
        ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (err) {
        dispatch(appError(err.message));
      }
    };

    initContract();
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
          onClick={e => {
            e.preventDefault();
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
        <MenuItem
          onClick={e => {
            e.preventDefault();
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
        >
          <ImageWrapper>
            <Image src={arrow} width={20} height={20}></Image>
          </ImageWrapper>
          <MenuInnerText>Check Balance / Withdraw Fund</MenuInnerText>
        </MenuItem>
        <MenuItem
          onClick={e => {
            e.preventDefault();
            if (!blockchain.account) dispatch(connect());
          }}
        >
          <ImageWrapper>
            <Image src={arrow} width={20} height={20}></Image>
          </ImageWrapper>
          <MenuInnerText>
            {blockchain.account ? blockchain.account : "Connect Wallet"}
          </MenuInnerText>
        </MenuItem>
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
        case WindowType.MANUAL:
          return null; // TODO
      }
    });
  };

  const renderTabs = () => {
    return app.tabs.map(tab => <Tab id={tab.id}>{tab.name}</Tab>);
  };

  return (
    <DesktopContainer>
      <DesktopItemList>
        <DesktopItem
          title={"about.txt"}
          parentId={-1}
          onClick={() => {
            dispatch(
              openWindow({
                window: {
                  id: "manual",
                  name: "about.txt",
                  type: WindowType.MANUAL,
                  metadata: {}
                }
              })
            );
          }}
        />
        {blockchain.stories && renderStoryItems()}
      </DesktopItemList>
      {renderWindows()}
      <BottomWrapper>
        {renderMenu()}
        <BarWrapper>
          <StartButton
            onClick={e => {
              e.preventDefault();
              toggleMenu();
            }}
          >
            Start
          </StartButton>
          {renderTabs()}
        </BarWrapper>
      </BottomWrapper>
      {app.errorMsg ? (
        <PopupModal
          state={modalState.ERROR}
          message={app.errorMsg}
          onClose={() => dispatch(clearAppError())}
          onOk={() => dispatch(clearAppError())}
        />
      ) : null}
    </DesktopContainer>
  );
}

export const StartButton = styled(StyledButton)`
  padding: 5px 15px;
  margin-right: 10px;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: left;
  width: 100%;
  height: 100%;
  height: 100vh;
  width: 100vw;
`;

const MenuWrapper = styled.div`
  width: 350px;
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

const MenuItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  &:hover {
    background-color: darkgrey;
  }
  cursor: pointer;
`;

const MenuInnerText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70%;
`;

const ImageWrapper = styled.div`
  margin: 10px;
`;

export default App;
