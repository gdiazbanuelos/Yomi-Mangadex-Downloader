<script lang="ts">
    import axios from "axios";
    import { downloadDir } from '@tauri-apps/api/path';
    import { readTextFile, writeTextFile, createDir, BaseDirectory, writeBinaryFile, writeFile, readBinaryFile} from '@tauri-apps/api/fs';
    import { invoke } from '@tauri-apps/api/tauri'
    import logo from '../res/load.png';

    export let global_session;
    export let global_refresh;
    export let authed: boolean;

    let manga_name: String;
    let manga_list;
    let manga_chapters;

    let current_manga_title;
    let current_manga_id;


    let hide_search = false;
    let hide_chapters = true;
    let download_inprogress = false;

    const baseUrl = 'https://api.mangadex.org';
    const translate_language = "en";


    async function getManga(){
        if(manga_name === undefined) return;

        const order = {
            relevance: 'desc',
            rating: 'desc',
            followedCount: 'desc'
        };
        const finalOrderQuery = {};

        // { "order[rating]": "desc", "order[followedCount]": "desc" }
        for (const [key, value] of Object.entries(order)) {
            finalOrderQuery[`order[${key}]`] = value;
        };

        const resp = await axios({
            method: 'GET',
            url: `${baseUrl}/manga`,
            params: {
                title: manga_name,
                ...finalOrderQuery
            }
        });

        manga_list = new Map();
        resp.data.data.map(manga => {
            console.log(manga.id);
            console.log(manga.attributes.title);
            console.log();
            manga_list.set(manga.id, manga.attributes)
        });

    }


    async function getChapters(mangaID){
        hide_search = true;
        hide_chapters = false;
        current_manga_id = mangaID;
        current_manga_title = manga_list.get(mangaID).title;

        const chapter_order = {
        chapter: 'asc'
        };
        const chapter_finalOrderQuery = {};

        for (const [key, value] of Object.entries(chapter_order)) {
            chapter_finalOrderQuery[`order[${key}]`] = value;
        };

        const resp = await axios({
            method: 'GET',
            url: `${baseUrl}/manga/${mangaID}/feed`,
            params: {
                ...chapter_finalOrderQuery
            }
        });

        manga_chapters = new Map();
        console.log(resp);


        resp.data.data.map(chapter => {
            if(chapter.attributes.translatedLanguage !== translate_language) return;

            manga_chapters.set(chapter.id, chapter.attributes);
            //console.log(chapter);
            //console.log("Chapter ID: " + chapter.id);
            //console.log("Chapter Title: " + chapter.attributes.title);
            //console.log("Chapter : " + chapter.attributes.chapter);
            //console.log("Pages : " + chapter.attributes.pages);
            //console.log("Language: " + chapter.attributes.translatedLanguage);
            //console.log("Uploader ID: " + chapter.relationships[0].id);
            //getAuthor(chapter.relationships[0].id);
            //console.log();
        });

    }

    function showMangaSearch(){
        hide_search = false;
        hide_chapters = true;
    }


    async function downloadChapter(chapterID){

        const resp = await axios({
            method: 'GET',
            url: `${baseUrl}/at-home/server/${chapterID}`,
        });

        let host, hash, data, dataSaver, chapterHash;

        host = resp.data.baseUrl;
        chapterHash = resp.data.chapter.hash;
        data = resp.data.chapter.data;
        dataSaver = resp.data.chapter.dataSaver;

        let links = new Array();


        let manga_name = current_manga_title[translate_language];
        let chapter_name = manga_chapters.get(chapterID).title;
        let chapter_number = manga_chapters.get(chapterID).chapter;
        console.log("DOWNLOAD!");
        console.log("Manga name: " + manga_name);
        console.log("Manga chapter name: " + chapter_name);
        console.log("Manga chapter number: " + chapter_number);


        let rel_download_path = `mangadex-dl\\${manga_name}\\Chapter ${chapter_number} - ${chapter_name}`;
        await createDir(rel_download_path, { dir: BaseDirectory.Download, recursive: true });
        const downloadDirPath = await downloadDir();
        const subfolderPath = `${downloadDirPath}${rel_download_path}`;
        console.log(subfolderPath);

        for (const page of data) {
            let link = `${host}/data/${chapterHash}/${page}`;
            links.push(link);
            //console.log(link);

            const resp = await axios({
                method: 'GET',
                url: `${host}/data/${chapterHash}/${page}`,
                responseType: 'arraybuffer'
            });

            download_inprogress = true;
            await writeBinaryFile(`${subfolderPath}/${page}`, resp.data);
            
        };

        download_inprogress = false;
        console.log(`Downloaded ${data.length} pages.`);
    }

</script>

{#if authed}
{#if !hide_search}
<div>
    <br>
    <h2>Enter Manga name:</h2>
    <input bind:value={manga_name} class="text-black font-bold">
    <button on:click={getManga} class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold py-2 px-4 rounded-full">
        Search 
    </button>
    <br><br>
    
    {#if manga_list}
        {#each [...manga_list] as [key, value]}
            {value.title.en}<br>
            <button on:click={getChapters(key)} class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold mt-2 py-1 px-2 rounded-full">
                Get chapters
            </button>
            <br><br>
        {/each}
    {/if}
</div>
{/if}


{#if !hide_chapters}
    <button on:click={showMangaSearch} class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold mt-2 py-1 px-2 rounded-full">
        Home
    </button>
    <br><br>
    <h1>{manga_list.get(current_manga_id).title.en}</h1>
    <p>Manga ID: {current_manga_id}</p>
    <br><br>
    {#if manga_chapters}
        {#if !download_inprogress}
            {#each [...manga_chapters] as [key, value]}
                <p>Chapter: {value.chapter}</p>
                <p>{value.title}</p>
                <p>Pages: {value.pages}</p>
                <button on:click={downloadChapter(key)} class="bg-[#d12a00] hover:bg-[#851b00] text-white font-bold mt-2 py-1 px-1 rounded-full">
                    Download chapter
                </button>
                <br><br>
            {/each}
        {/if}
    {/if}
{/if}

{#if download_inprogress}
    <div class="justify-center flex">
        <p>Downloading</p>
        <img src={logo} class="animate-spin h-7 w-7 mr-3 ml-4" alt="..." />
    </div>
{/if}
{/if}