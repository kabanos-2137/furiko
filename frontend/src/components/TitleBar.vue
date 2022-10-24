<template>
    <div id="title-bar">
        <p id="title-paragraph">Furiko</p>
        <p id="subtitle-paragraph">Welcome Back</p>
    </div>
</template>

<script>
    export default {
        name: 'TitleBar'
    }
</script>

<style scoped>
    #title-paragraph{
        margin-bottom: 0;
        text-align: center;
        color: #51c1e6;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 40px;
    }

    #subtitle-paragraph{
        margin-top: 0;
        text-align: center;
        color: #51c1e6;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        font-size: 15px;
    }

    #title-bar{
        width: 100%;
        height: auto;
        border-bottom: 2px solid #51c1e6;
    }
</style>