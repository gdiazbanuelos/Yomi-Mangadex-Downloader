<script lang="ts">
    import { readTextFile, writeTextFile, BaseDirectory, exists, createDir} from '@tauri-apps/api/fs';
    import { appDataDir } from '@tauri-apps/api/path';

    import axios from "axios";

    import logo from '../res/load.png';

    export let global_session: string;
    export let global_refresh: string;
    export let authed: boolean = false;

    let username: string;
    let email: string;
    let password: string;

    let credentials_error: boolean;
    let credentials_input: boolean;

    const baseUrl = 'https://api.mangadex.org';

    createDir('tokens', { dir: BaseDirectory.AppData, recursive: true });

    async function login() {

        exists('tokens\\tokens.json', { dir: BaseDirectory.AppData }).then(
            file_exists => {
                if(!file_exists){
                    const data = {
                        "session": "",
                        "refresh": ""
                    };
                    const jsonData = JSON.stringify(data);
                    writeTextFile('tokens\\tokens.json', jsonData, { dir: BaseDirectory.AppData });
                    login_with_credentials();
                } else {
                    console.log("attempting logging with tokens!");
                    login_with_tokens();
                }
            },
            err => {
                console.log(err);
            }
        )
    }
    login();


    async function login_with_credentials(){
        let credentials;

        exists('tokens\\credentials.json', { dir: BaseDirectory.AppData }).then(
            resp => {
                if(resp){
                    readTextFile('tokens\\credentials.json', { dir: BaseDirectory.AppData }).then(
                        resp => {
                            credentials = JSON.parse(resp);
                            login_with_local_creds(credentials);
                        },
                        err => {
                            console.log("Error reading credentials.json?");
                        }
                    )
                } else {
                    credentials_input = true;
                }
            },
            err => {
                console.log("Error reading credentials.json?");
            }
        )
    }

    async function login_with_local_creds(credentials){
        try{
            const resp = await axios({
                method: 'POST',
                url: `${baseUrl}/auth/login`,
                headers: {
                    'Content-Type': 'application/json'
                },
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
                await writeTextFile('tokens\\tokens.json', jsonData, { dir: BaseDirectory.AppData });
            } else {

                console.log("Error logging in! Credentials may be wrong?");
            }
        } catch (err){
            credentials_error = true;
            credentials_input = true;
            console.log("Axios error! Error logging in! Credentials may be wrong?");
            credentials_error = true;
            // show wrong cerds
        }
    }


    async function login_with_tokens(){
        const contents = await readTextFile('tokens\\tokens.json', { dir: BaseDirectory.AppData }).then(
            resp => {
                resp = JSON.parse(resp);
                let session = resp.session;
                let refresh = resp.refresh;
                check_authenticated(session, refresh);
            },
            err =>{
                console.log(err);
            }
        )
    }


    async function check_authenticated(session: string, refresh: string){
        try{
            const resp = await axios({
                method: 'GET',
                url: `${baseUrl}/auth/check`,
                headers: {'Authorization': `Bearer ${session}`}
            });
            console.log(resp);

            if (resp.status === 200) {
                console.log("Authed?: " + resp.data.isAuthenticated);
                authed = true;
            } else {
                console.log("Check auth != 200");
                refresh_token(refresh);
            }
        } catch (err){
            console.log("Auth check 401, unauthed!");
            refresh_token(refresh);
        }
    }


    async function refresh_token(refresh: string){
        try{
            const resp = await axios({
                method: 'POST',
                url: `${baseUrl}/auth/refresh`,
                headers: {'Content-Type': 'application/json'},
                data: refresh
            });

            if (resp.status === 200) {
                console.log("Token refreshed!")
        
                authed = true;
                global_session = resp.data.token.session;
                global_refresh = resp.data.token.refresh;

                const data = {
                    "session": resp.data.token.session,
                    "refresh": resp.data.token.refresh
                };

                const jsonData = JSON.stringify(data);
                await writeTextFile('tokens.json', jsonData, { dir: BaseDirectory.AppConfig });
                login_with_tokens();
            } else {
                console.log("Error refreshing with refresh token! Logging in with credentials");
                login_with_credentials();
            }
        } catch (err){
            console.log("Axios 401: Error refreshing with refresh token! Logging in with credentials");
            login_with_credentials();
        }
    }

    async function store_creds(){
        const data = {
            "username": username,
            "email": email,
            "password": password
        };
        const jsonData = JSON.stringify(data);
        await writeTextFile('tokens\\credentials.json', jsonData, { dir: BaseDirectory.AppData });
        login_with_local_creds(data);
    }


    function nothing(){}

</script>

<div>

    {#if !authed}

        {#if credentials_input}
            <div class="text-black mt-6">
                <p class="text-white font-bold">Mangadex username:</p>
                <input bind:value={username} class="mt-1 font-bold"><br>

                <p class="text-white font-bold mt-6">Mangadex email:</p>
                <input bind:value={email} class="mt-1 font-bold"><br>

                <p class="text-white font-bold mt-6 ">Mangadex password:</p>
                <input bind:value={password} type="password" class="mt-1 font-bold"><br>

                <button on:click={store_creds} class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold mt-8 py-1 px-4 rounded-full">   
                    Login
                </button>
            </div>
        {/if}


        {#if credentials_error}
            <h1 class="mt-4 font-bold text-2xl">Credentials did not work!</h1>
        {/if}

        {#if !credentials_error && !credentials_input}
            <div class="justify-center flex mt-6">
                <h1>Logging in, please wait</h1>
                <img src={logo} class="animate-spin h-7 w-7 mr-3 ml-4" alt="..." />
            </div>
        {/if}

    {/if}

</div>
