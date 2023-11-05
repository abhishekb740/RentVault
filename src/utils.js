export const GetIpfsUrlFromPinata = (pinataUrl) => {
    if(pinataUrl === null) return;
    var IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
    return IPFSUrl;
};