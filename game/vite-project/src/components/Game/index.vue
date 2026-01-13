<script setup>
import Sence from './Sence.vue'
import Cat from './Cat.vue'

/*
    背景

    角色
    物品列表

    游戏逻辑
        准备好题目
            纸巾, 萝卜, 米老鼠
        素材
            图片, 音频, 中英文(纸巾, 萝卜, 米老鼠)
        随机出题
            展示中文, 播放声音
            展示文本框, 文本框上方展示中文
        用户答题, 在文本框中输入英文
            答错了
                小猫随机选一个错误的
                重复播放一遍题目
            答对了
                小猫摸象对应的物品
*/
</script>
<template>
    <div class="game">
        <Cat />
        <Sence />
    </div>
</template> 
<style lang="scss">
.game {
    height: 600px;
    width: 350px;
    margin: auto;
    position: relative;
}
</style>
