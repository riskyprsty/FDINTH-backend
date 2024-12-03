import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

interface SessionCookie {
  name: string;
  value: string;
}

interface LoginResponse {
  access_token: string;
  session_key: string;
  session_cookies: SessionCookie[];
  uid: string;
}

const randomString = (length: number) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export const loginByEmailAndPassword = async (
  email: string,
  password: string
): Promise<{ token: string; cookies: string } | null> => {
  const userAgent =
    "Dalvik/2.1.0 (Linux; U; Android 12; Infinix X669 Build/SP1A.210812.016) [FBAN/Orca-Android;FBAV/377.0.0.13.101;FBPN/com.facebook.orca;FBLC/en_US;FBBV/396116327;FBCR/MTN;FBMF/INFINIX;FBBD/Infinix;FBDV/Infinix X669;FBSV/12;FBCA/armeabi-v7a:armeabi;FBDM/{density=2.0,width=720,height=1444};FB_FW/1;]";

  try {
    const headers = {
      Host: "b-graph.facebook.com",
      "X-Fb-Connection-Quality": "EXCELLENT",
      Authorization: "OAuth 350685531728|62f8ce9f74b12f84c123cc23437a4a32",
      "User-Agent": userAgent,
      "X-Tigon-Is-Retry": "false",
      "X-Fb-Friendly-Name": "authenticate",
      "X-Fb-Connection-Bandwidth": `${
        Math.floor(Math.random() * 10000000) + 70000000
      }`,
      "Zero-Rated": "0",
      "X-Fb-Net-Hni": `${Math.floor(Math.random() * 10000) + 50000}`,
      "X-Fb-Sim-Hni": `${Math.floor(Math.random() * 10000) + 50000}`,
      "X-Fb-Request-Analytics-Tags": JSON.stringify({
        network_tags: { product: "350685531728", retry_attempt: "0" },
        application_tags: "unknown",
      }),
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Fb-Connection-Type": "WIFI",
      "X-Fb-Device-Group": `${Math.floor(Math.random() * 300) + 4700}`,
      Priority: "u=3,i",
      "Accept-Encoding": "gzip, deflate",
      "X-Fb-Http-Engine": "Liger",
      "X-Fb-Client-Ip": "true",
      "X-Fb-Server-Cluster": "true",
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const data = {
      adid: uuidv4(),
      format: "json",
      device_id: uuidv4(),
      email: email,
      password: `#PWD_FB4A:0:${timestamp}:${password}`,
      generate_analytics_claim: "1",
      community_id: "",
      linked_guest_account_userid: "",
      cpl: true,
      try_num: "1",
      family_device_id: uuidv4(),
      secure_family_device_id: uuidv4(),
      credentials_type: "password",
      account_switcher_uids: [],
      fb4a_shared_phone_cpl_experiment:
        "fb4a_shared_phone_nonce_cpl_at_risk_v3",
      fb4a_shared_phone_cpl_group: "enable_v3_at_risk",
      enroll_misauth: false,
      generate_session_cookies: "1",
      error_detail_type: "button_with_disabled",
      source: "login",
      machine_id: randomString(24),
      jazoest: `${Math.floor(Math.random() * 1000) + 22000}`,
      meta_inf_fbmeta: "V2_UNTAGGED",
      advertiser_id: uuidv4(),
      encrypted_msisdn: "",
      currently_logged_in_userid: "0",
      locale: "id_ID",
      client_country_code: "ID",
      fb_api_req_friendly_name: "authenticate",
      fb_api_caller_class: "Fb4aAuthHandler",
      api_key: "882a8490361da98702bf97a021ddc14d",
      sig: crypto
        .createHash("md5")
        .update(uuidv4())
        .digest("hex")
        .substring(0, 32),
      access_token: "350685531728|62f8ce9f74b12f84c123cc23437a4a32",
    };

    const response = await axios.post(
      "https://b-graph.facebook.com/auth/login",
      new URLSearchParams(
        Object.entries(data).reduce(
          (acc: Record<string, string>, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {}
        )
      ),
      { headers }
    );

    const result: LoginResponse = response.data;

    if (result.session_key && result.access_token) {
      const uid = result.uid;
      const token = result.access_token;
      const cookie = result.session_cookies
        .map((c: SessionCookie) => `${c.name}=${c.value}`)
        .join(";");

      return {
        token: token,
        cookies: cookie,
      };
    } else {
      throw new Error("Failed Login!");
    }
  } catch (error) {
    throw new Error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};
