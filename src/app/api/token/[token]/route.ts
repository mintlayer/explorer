import { NextResponse } from "next/server";
import { getUrl } from "@/utils/network";

const NODE_API_URL = getUrl();

export const dynamic = "force-dynamic";

const ipfsToHttps = (url: string) => {
  if(!url.startsWith('ipfs://')){
    return url;
  }

  const cleanUrl = url.replace('ipfs://', '').split('/');
  return `https://${cleanUrl[0]}.ipfs.w3s.link${cleanUrl[1]?'/'+cleanUrl[1]:''}`;
}


export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token;

  const res = await fetch(NODE_API_URL + "/token/" + token, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  if(data.error === 'Token not found') {
    const res_nft = await fetch(NODE_API_URL + "/nft/" + token, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data_nft = await res_nft.json();

    const response = {
      type: 'nft',
      ...data_nft,
      token_ticker: data_nft.ticker,
    };

    return NextResponse.json(response);
  }

  const res_stats = await fetch(NODE_API_URL + "/statistics/token/" + token, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data_stats = await res_stats.json();

  const metadataUrl = ipfsToHttps(data.metadata_uri.string);
  const metadataRes = await fetch(metadataUrl).catch(() => {
    data.metadata_invalid = true;
    return null;
  });
  const metadata = metadataRes && await metadataRes.json().catch(() => {
    data.metadata_invalid = true;
    return null;
  });
  data.metadata = metadata;

  if(data.metadata?.tokenIcon){
    data.tokenIcon = ipfsToHttps(data.metadata.tokenIcon);
  }

  let response: any = {};

  response = {
    type: 'token',
    ...data,
    ...data_stats,
  };

  return NextResponse.json(response);
}
