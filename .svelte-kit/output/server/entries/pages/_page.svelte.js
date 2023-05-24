import { c as create_ssr_component, d as add_attribute, v as validate_component } from "../../chunks/index2.js";
import { createDir, BaseDirectory, exists, writeTextFile, readTextFile } from "@tauri-apps/api/fs";
import "@tauri-apps/api/path";
import axios from "axios";
import "@tauri-apps/api/tauri";
const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div><h1 class="text-2xl font-bold">Yomi-DL</h1></div>`;
});
const logo = "/_app/immutable/assets/load.d0834d5e.png";
const baseUrl = "https://api.mangadex.org";
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { global_session } = $$props;
  let { global_refresh } = $$props;
  let { authed = false } = $$props;
  let username;
  let email;
  let password;
  let credentials_error;
  let credentials_input;
  createDir("tokens", {
    dir: BaseDirectory.AppData,
    recursive: true
  });
  async function login() {
    exists("tokens\\tokens.json", { dir: BaseDirectory.AppData }).then(
      (file_exists) => {
        if (!file_exists) {
          const data = { "session": "", "refresh": "" };
          const jsonData = JSON.stringify(data);
          writeTextFile("tokens\\tokens.json", jsonData, { dir: BaseDirectory.AppData });
          login_with_credentials();
        } else {
          console.log("attempting logging with tokens!");
          login_with_tokens();
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  login();
  async function login_with_credentials() {
    let credentials;
    exists("tokens\\credentials.json", { dir: BaseDirectory.AppData }).then(
      (resp) => {
        if (resp) {
          readTextFile("tokens\\credentials.json", { dir: BaseDirectory.AppData }).then(
            (resp2) => {
              credentials = JSON.parse(resp2);
              login_with_local_creds(credentials);
            },
            (err) => {
              console.log("Error reading credentials.json?");
            }
          );
        } else {
          credentials_input = true;
        }
      },
      (err) => {
        console.log("Error reading credentials.json?");
      }
    );
  }
  async function login_with_local_creds(credentials) {
    try {
      const resp = await axios({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        headers: { "Content-Type": "application/json" },
        data: credentials
      });
      if (resp.status === 200) {
        const data = {
          "session": resp.data.token.session,
          "refresh": resp.data.token.refresh
        };
        console.log("Logged in with credentials");
        authed = true;
        const jsonData = JSON.stringify(data);
        await writeTextFile("tokens\\tokens.json", jsonData, { dir: BaseDirectory.AppData });
      } else {
        console.log("Error logging in! Credentials may be wrong?");
      }
    } catch (err) {
      credentials_error = true;
      credentials_input = true;
      console.log("Axios error! Error logging in! Credentials may be wrong?");
      credentials_error = true;
    }
  }
  async function login_with_tokens() {
    await readTextFile("tokens\\tokens.json", { dir: BaseDirectory.AppData }).then(
      (resp) => {
        resp = JSON.parse(resp);
        let session = resp.session;
        let refresh = resp.refresh;
        check_authenticated(session, refresh);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  async function check_authenticated(session, refresh) {
    try {
      const resp = await axios({
        method: "GET",
        url: `${baseUrl}/auth/check`,
        headers: { "Authorization": `Bearer ${session}` }
      });
      console.log(resp);
      if (resp.status === 200) {
        console.log("Authed?: " + resp.data.isAuthenticated);
        authed = true;
      } else {
        console.log("Check auth != 200");
        refresh_token(refresh);
      }
    } catch (err) {
      console.log("Auth check 401, unauthed!");
      refresh_token(refresh);
    }
  }
  async function refresh_token(refresh) {
    try {
      const resp = await axios({
        method: "POST",
        url: `${baseUrl}/auth/refresh`,
        headers: { "Content-Type": "application/json" },
        data: refresh
      });
      if (resp.status === 200) {
        console.log("Token refreshed!");
        authed = true;
        global_session = resp.data.token.session;
        global_refresh = resp.data.token.refresh;
        const data = {
          "session": resp.data.token.session,
          "refresh": resp.data.token.refresh
        };
        const jsonData = JSON.stringify(data);
        await writeTextFile("tokens.json", jsonData, { dir: BaseDirectory.AppConfig });
        login_with_tokens();
      } else {
        console.log("Error refreshing with refresh token! Logging in with credentials");
        login_with_credentials();
      }
    } catch (err) {
      console.log("Axios 401: Error refreshing with refresh token! Logging in with credentials");
      login_with_credentials();
    }
  }
  if ($$props.global_session === void 0 && $$bindings.global_session && global_session !== void 0)
    $$bindings.global_session(global_session);
  if ($$props.global_refresh === void 0 && $$bindings.global_refresh && global_refresh !== void 0)
    $$bindings.global_refresh(global_refresh);
  if ($$props.authed === void 0 && $$bindings.authed && authed !== void 0)
    $$bindings.authed(authed);
  return `<div>${!authed ? `${credentials_input ? `<div class="text-black mt-6"><p class="text-white font-bold">Mangadex username:</p>
                <input class="mt-1 font-bold"${add_attribute("value", username, 0)}><br>

                <p class="text-white font-bold mt-6">Mangadex email:</p>
                <input class="mt-1 font-bold"${add_attribute("value", email, 0)}><br>

                <p class="text-white font-bold mt-6 ">Mangadex password:</p>
                <input type="password" class="mt-1 font-bold"${add_attribute("value", password, 0)}><br>

                <button class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold mt-8 py-1 px-4 rounded-full">Login
                </button></div>` : ``}


        ${credentials_error ? `<h1 class="mt-4 font-bold text-2xl">Credentials did not work!</h1>` : ``}

        ${!credentials_error && !credentials_input ? `<div class="justify-center flex mt-6"><h1>Logging in, please wait</h1>
                <img${add_attribute("src", logo, 0)} class="animate-spin h-7 w-7 mr-3 ml-4" alt="..."></div>` : ``}` : ``}</div>`;
});
const Manga = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { global_session } = $$props;
  let { global_refresh } = $$props;
  let { authed } = $$props;
  let manga_name;
  if ($$props.global_session === void 0 && $$bindings.global_session && global_session !== void 0)
    $$bindings.global_session(global_session);
  if ($$props.global_refresh === void 0 && $$bindings.global_refresh && global_refresh !== void 0)
    $$bindings.global_refresh(global_refresh);
  if ($$props.authed === void 0 && $$bindings.authed && authed !== void 0)
    $$bindings.authed(authed);
  return `${authed ? `${`<div><br>
    <h2>Enter Manga name:</h2>
    <input class="text-black font-bold"${add_attribute("value", manga_name, 0)}>
    <button class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold py-2 px-4 rounded-full">Search 
    </button>
    <br><br>
    
    ${``}</div>`}


${``}

${``}` : ``}`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "html{background-color:#18212f}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let global_session;
  let global_refresh;
  let authed;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<h1 class="text-white text-center">${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})}
    ${validate_component(Login, "Login").$$render(
      $$result,
      { global_session, global_refresh, authed },
      {
        global_session: ($$value) => {
          global_session = $$value;
          $$settled = false;
        },
        global_refresh: ($$value) => {
          global_refresh = $$value;
          $$settled = false;
        },
        authed: ($$value) => {
          authed = $$value;
          $$settled = false;
        }
      },
      {}
    )}
    ${validate_component(Manga, "Manga").$$render($$result, { global_session, global_refresh, authed }, {}, {})}
</h1>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
