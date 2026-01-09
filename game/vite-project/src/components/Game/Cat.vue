<script setup>
import { ref } from 'vue'
import cat_prepare from '@/assets/cat_prepare.png'

/*
    猫咪的各种状态
        1. 站立
        2. 吃饭
        3. 指向 左中右
*/

const cat = ref({
    x: 100,
    y: 100,
})
</script>
<template>
    <div class="cat" :style="{ backgroundImage: `url(${cat_prepare})` }">
        Cat
    </div>
</template>
<style lang="scss">
.cat {
    height: 280px;
    width: 220px;
    background-size: 100% 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
}
</style>
