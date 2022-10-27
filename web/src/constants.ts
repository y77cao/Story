const deviceWidth = {
  mobileS: "320px",
  mobileM: "375px",
  mobileL: "425px",
  tablet: "768px",
  laptop: "1024px",
  laptopL: "1440px",
  desktop: "2560px"
};

export const device = {
  mobileS: `(max-width: ${deviceWidth.mobileS})`,
  mobileM: `(max-width: ${deviceWidth.mobileM})`,
  mobileL: `(max-width: ${deviceWidth.mobileL})`,
  tablet: `(max-width: ${deviceWidth.tablet})`,
  laptop: `(max-width: ${deviceWidth.laptop})`,
  laptopL: `(max-width: ${deviceWidth.laptopL})`,
  desktop: `(max-width: ${deviceWidth.desktop})`,
  desktopL: `(max-width: ${deviceWidth.desktop})`
};
