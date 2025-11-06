function getIconUrl(metadataUri: string, tokenIcon: string): string {
  if (/^(https?:|ipfs:)/.test(tokenIcon)) {
    return tokenIcon;
  }

  const baseUri = metadataUri.substring(0, metadataUri.lastIndexOf("/") + 1);

  return baseUri + tokenIcon;
}

const ipfsToHttps = (url: string) => {
  if(!url){
    return null;
  }
  if(!url.startsWith('ipfs://')){
    return url;
  }
  const cleanUrl = url.replace('ipfs://', '').split('/');
  return `https://${cleanUrl[0]}.ipfs.w3s.link${cleanUrl[1]?'/'+cleanUrl[1]:''}`;
}

export const TokenIcon = ({ metadata_uri, metadata, ticker }: any) => {
  const iconUrlMetadata = metadata?.tokenIcon ? getIconUrl(metadata_uri, metadata.tokenIcon) : null;

  const icon = iconUrlMetadata ? ipfsToHttps(iconUrlMetadata) : null;

  return <>
    <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
      {
        icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt={ticker} />
        ) : <></>
      }
    </div>
  </>;
}
