import { TwitterApi } from "twitter-api-v2";
import { config } from "dotenv";
config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});


export async function twitterPost(status) {
  const newPost = await twitterClient.v2.tweet(status);

  return {
    content: [
      {
        type: "text",
        text: `Tweeted: ${status}`,
      },
    ],
  };
}