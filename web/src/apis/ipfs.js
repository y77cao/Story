const IPFS_ENDPOINT = "https://api.pinata.cloud";
const ASSET_PATH = "/story_assets";
const METADATA_PATH = "/story_metadata";

export const pinToIPFS = (blob, name) => {
  const endpoint = `${IPFS_ENDPOINT}/pinning/pinFileToIPFS`;
  const data = new FormData();

  data.append(`file`, blob, `${ASSET_PATH}/${name}.png`);

  return fetch(endpoint, {
    method: "POST",
    maxBodyLength: "Infinity",
    headers: {
      // pinata_api_key: process.env.REACT_APP_IPFS_API_KEY,
      // pinata_secret_api_key: process.env.REACT_APP_IPFS_SECRET_KEY
    },
    body: data
  }).then(res => {
    console.log(res.json());
    return res;
  });
};
