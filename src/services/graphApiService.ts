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

export const retrieveUserData = async (
  cookies: string
): Promise<{ user_id: string; username: string; token: string } | null> => {
  const businessUrl = "https://business.facebook.com/business_locations";
  const graphUrl = "https://graph.facebook.com/me/";

  setCookies(cookies, businessUrl);

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.86 Mobile Safari/537.36",
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
        return {
          user_id: graphResponse.id,
          username: graphResponse.name,
          token: accessToken,
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
  token: string
): Promise<{ user_id: string; username: string; token: string } | null> => {
  const graphUrl = "https://graph.facebook.com/me/";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.86 Mobile Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    Accept: "*/*",
    Connection: "keep-alive",
  };

  const graphResponse = await makeRequest(
    `${graphUrl}?access_token=${token}`,
    headers
  );

  if (graphResponse) {
    return {
      user_id: graphResponse.id,
      username: graphResponse.name,
      token: token,
    };
  } else {
    throw new Error("Failed to fetch data from Graph API.");
  }
};
