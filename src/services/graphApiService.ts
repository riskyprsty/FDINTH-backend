import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const setCookies = (cookieString: string, url: string) => {
  cookieString.split(";").forEach((cookie) => {
    const trimmedCookie = cookie.trim();
    jar.setCookieSync(trimmedCookie, url);
  });
};

const makeRequest = async (url: string, headers: object): Promise<any> => {
  try {
    const response = await client.get(url, { headers });
    return response.data;
  } catch (error: any) {
    console.error(`Error in request to ${url}:`, error.message);
    return null;
  }
};

const getProfilePicture = async (
  token: string,
  user_agent: string
): Promise<string | null> => {
  try {
    const url = `https://graph.facebook.com/me/picture`;

    const headers = {
      "User-Agent": user_agent,
      "Accept-Encoding": "gzip, deflate, br",
      Accept: "*/*",
      Connection: "keep-alive",
    };

    const params = {
      access_token: token,
      redirect: false,
      type: "large",
    };

    const response = await axios.get(url, { params, headers });

    const pictureData = response.data.data;
    return pictureData.url;
  } catch (error) {
    console.error(
      "Error fetching profile picture:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const retrieveUserData = async (
  cookies: string,
  user_agent: string
): Promise<{
  user_id: string;
  username: string;
  token: string;
  profile_pict: string | null;
} | null> => {
  const businessUrl = "https://business.facebook.com/business_locations";
  const graphUrl = "https://graph.facebook.com/me/";

  setCookies(cookies, businessUrl);

  const headers = {
    "User-Agent": user_agent,
    "Accept-Encoding": "gzip, deflate, br",
    Accept: "*/*",
    Connection: "keep-alive",
  };

  const businessData = await makeRequest(businessUrl, headers);

  if (businessData) {
    const dataString = JSON.stringify(businessData);
    const tokenMatch = dataString.match(/EAA[A-Za-z0-9]+/);
    if (tokenMatch) {
      const accessToken = tokenMatch[0];

      const graphHeaders = {
        ...headers,
        Cookie: "coki=" + cookies,
      };

      const graphResponse = await makeRequest(
        `${graphUrl}?access_token=${accessToken}`,
        graphHeaders
      );

      if (graphResponse) {
        const profilePicture = await getProfilePicture(accessToken, user_agent);

        return {
          user_id: graphResponse.id,
          username: graphResponse.name,
          token: accessToken,
          profile_pict: profilePicture || null,
        };
      } else {
        throw new Error("Failed to fetch data from Graph API.");
      }
    } else {
      throw new Error("Access token not found in the business data response.");
    }
  } else {
    throw new Error("Failed to fetch data from the business endpoint.");
  }
};

export const retrieveUserDataFromToken = async (
  token: string,
  user_agent: string
): Promise<{
  user_id: string;
  username: string;
  token: string;
  profile_pict: string | null;
} | null> => {
  const graphUrl = "https://graph.facebook.com/me/";

  const headers = {
    "User-Agent": user_agent,
    "Accept-Encoding": "gzip, deflate, br",
    Accept: "*/*",
    Connection: "keep-alive",
  };

  const graphResponse = await makeRequest(
    `${graphUrl}?access_token=${token}`,
    headers
  );

  if (graphResponse) {
    const profilePicture = await getProfilePicture(token, user_agent);

    return {
      user_id: graphResponse.id,
      username: graphResponse.name,
      token: token,
      profile_pict: profilePicture || null,
    };
  } else {
    throw new Error("Failed to fetch data from Graph API.");
  }
};
