import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { v4 as uuidv4 } from "uuid";
import qs from "querystring";

interface Post {
  postId: string;
  actorName: string;
  viewerName: string;
  viewerId: string;
  message: string;
  hashtags: string[];
  likersCount: string;
}

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

export const fetchFeedPost = async (
  token: string,
  user_agent: string
): Promise<Post[]> => {
  const body = {
    method: "post",
    pretty: "false",
    format: "json",
    server_timestamps: "true",
    locale: "en_US",
    fb_api_req_friendly_name: "fresh_feed_more_data_fetch",
    fb_api_caller_class: "graphservice",
    client_doc_id: "10456068821118367606041270163",
    variables: {
      pyml_first_fetch_size: 8,
      gysj_cover_photo_width_param: 315,
      image_large_aspect_height: 264,
      profile_image_size: 45,
      fbstory_tray_preview_height: 265,
      device_id: uuidv4(),
      after_home_story_param:
        "FRQVAhsBXAIVFBhcTVRjek16QTNPRFUyTXpveE56TXpNRGM0TlRZek9qRXdPalkzT0RJek1qZzBNRE01T1RZMk9ESXlNVEU2TURvdE9EQTNOVGcwTkRneU16TXlOVGswT0RJeU9nPT0AGwFVHBQVAAA%3D",
      fetch_remix_feedback_metadata: true,
      image_large_aspect_width: 506,
      angora_attachment_cover_image_size: 540,
      goodwill_small_accent_image: 50,
      fetch_cix_screen_nt_payload: true,
      action_location: "feed",
      fb_shorts_group_author_picture_size: 32,
      image_high_height: 2048,
      action_links_location: "feed_mobile",
      friends_locations_profile_pic_size_param: 212,
      include_predicted_feed_topics: true,
      pyml_size_param: 45,
      greeting_card_image_size_large: 506,
      creative_med_img_size: 253,
      home_story_first_page_total_count: 10,
      creative_low_img_size: 169,
      include_post_render_format_conversation_first_ufi_options: true,
      enable_cix_screen_rollout: true,
      image_low_width: 169,
      gysj_size_param: 68,
      media_question_photo_size: 506,
      inspiration_capabilities: [
        {
          version: 164,
          type: "MSQRD_MASK",
          capabilities: [],
        },
        {
          version: 1,
          type: "FRAME",
        },
        {
          version: 1,
          type: "SHADER_FILTER",
          capabilities: [{ value: "true", name: "multipass" }],
        },
      ],
      query_id: "1733077153_09d65266-6dac-434d-bebc-ce24d01a67be",
      client_query_id: "1733077153_09d65266-6dac-434d-bebc-ce24d01a67be",
      enable_download: true,
      num_media_question_options: 15,
      feed_top_story_cache_score_enabled: true,
      orderby_home_story_param: ["top_stories"],
      multi_share_item_image_size_param: 236,
      discovery_image_size: 68,
      include_image_ranges: true,
      place_review_img_width: 299,
      media_type: "image/jpeg",
      instant_article_server_control_prefetch: true,
      quick_promotion_branding_image_size_param: 27,
      should_fetch_sponsored_bumpers: true,
      fetch_fbc_header: true,
      creative_high_img_size: 506,
      profile_pic_swipe_size_param: 212,
      pymk_size_param: 225,
      image_medium_width: 253,
      include_is_currently_live: true,
      question_poll_count: 100,
      battery_context: `{"is_charging":"${
        Math.random() < 0.5 ? "true" : "false"
      }","battery_level":${Math.floor(Math.random() * 100) + 1}}`,
      supported_compression_types: ["ZIP", "TAR_BROTLI"],
      fbstory_tray_preview_width: 149,
      greeting_card_image_size_medium: 253,
      reading_attachment_profile_image_height: 152,
      place_review_img_height: 158,
      poll_facepile_size: 45,
      include_should_inline_comment_composer: true,
      recent_vpvs_v2: [
        {
          vvt: -1,
          vspos: 0,
          vsid: "3023311443846054175",
          timestamp: new Date(),
          story_type: "IN_FEED_RECOMMENDATION",
          objid: "",
          feed_backend_data_serialized_payloads: "GxVG7AEmAsDzi9bFpO6xA",
        },
      ],
    },
  };

  const data = {
    access_token: token,
    method: "post",
    pretty: false,
    format: "json",
    server_timestamps: true,
    locale: "id_ID",
    fb_api_req_friendly_name: "fresh_feed_more_data_fetch",
    fb_api_caller_class: "graphservice",
    client_doc_id: "10456068821118367606041270163",
    variables: JSON.stringify(body),
    fb_api_analytics_tags: ["pagination_query", "GraphServices"],
    client_trace_id: uuidv4(),
  };

  try {
    const response = await axios.post(
      "https://graph.facebook.com/graphql",
      qs.stringify(data),
      {
        headers: {
          "User-Agent": user_agent,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const rawData = response.data;

    const postChunks = rawData
      .split('"data"')
      .filter((chunk: string) => chunk.trim() !== "");

    if (postChunks.length <= 2) {
      console.log(
        "Only one post found or invalid data. Please check the raw data format."
      );
      return [];
    }

    const posts = postChunks.map((chunk: string) => {
      const postIdMatch = chunk.match(/"post_id"\s*:\s*"(\d+)"/);
      const postId = postIdMatch ? postIdMatch[1] : "Unknown Post ID";

      const actorNameMatch = chunk.match(
        /"actors":\s*\[\s*\{\s*"__typename":\s*"User",[^}]*"name":\s*"([^"]+)"/
      );
      const actorName = actorNameMatch ? actorNameMatch[1] : "Unknown Actor";

      const viewerNameMatch = chunk.match(
        /"viewer_current_actor":\s*{\s*"__typename":\s*"User",[^}]*"name":\s*"([^"]+)"/
      );
      const viewerIdMatch = chunk.match(
        /"viewer_current_actor":\s*{\s*"__typename":\s*"User",[^}]*"id":\s*"([^"]+)"/
      );
      const viewerName = viewerNameMatch
        ? viewerNameMatch[1]
        : "Unknown Viewer Name";
      const viewerId = viewerIdMatch ? viewerIdMatch[1] : "Unknown Viewer ID";

      const messageMatch = chunk.match(/"message":\s*\{\s*"text":\s*"([^"]+)"/);
      const message = messageMatch ? messageMatch[1] : "No message";

      const hashtagMatches = [...chunk.matchAll(/"name"\s*:\s*"#([^"]+)"/g)];
      const hashtags = hashtagMatches.map((match) => `#${match[1]}`);

      const likersCountMatch = chunk.match(
        /"likers"\s*:\s*{\s*"count"\s*:\s*(\d+)/
      );
      const likersCount = likersCountMatch ? likersCountMatch[1] : "0";

      return {
        postId,
        actorName,
        viewerName,
        viewerId,
        message,
        hashtags,
        likersCount,
      };
    });

    const validPosts = posts.slice(1, posts.length - 1);

    return validPosts;
  } catch (error) {
    console.error(`Error: ${error}`);
    return [];
  }
};
