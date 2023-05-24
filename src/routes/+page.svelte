<script lang="ts">
    import Navbar from "../lib/Navbar.svelte";
    import Login from "../lib/Login.svelte";
    import Manga from "../lib/Manga.svelte";

    let global_session: string;
    let global_refresh: string;
    let authed: boolean;
</script>

<h1 class="text-white text-center">
    <Navbar />
    <Login bind:global_session={global_session} bind:global_refresh={global_refresh} bind:authed={authed}/>
    <Manga global_session={global_session} global_refresh={global_refresh} authed={authed}/>
</h1>


<style lang="postcss">
    :global(html) {
        background-color: #18212f;
    }
</style>