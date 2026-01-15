<script setup>
import { ref } from 'vue'
import cat_prepare from '@/assets/cat_prepare.png'
import cat_center from '@/assets/cat_center.png'
import cat_left from '@/assets/cat_left.png'
import cat_right from '@/assets/cat_right.png'
import cat_right_2 from '@/assets/cat_right_2.png'
import success from '@/assets/success.png'

// import cat_point_left from '@/assets/cat_point_left.png'
// import cat_point_middle from '@/assets/cat_point_middle.png'
// import cat_point_right from '@/assets/cat_point_right.png'

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

const cat_status = ref('cat_center')

const cat_status_map = {
    prepare: {
        backgroundImage: `url(${cat_prepare})`,
        top: '50%',
        left: '50%',
    },
    success: {
        backgroundImage: `url(${success})`,
        top: '50%',
        left: '50%',
        width: '235px',
        height: '280px',
    },
    center: {
        backgroundImage: `url(${cat_center})`,
        top: '60%',
        left: '50%',
        width: '220px',
        height: '350px',
    },
    left: {
        backgroundImage: `url(${cat_left})`,
        top: '55%',
        left: '45%',
        width: '220px',
        height: '280px',
    },
    right: {
        // url: cat_right,
        // url: cat_right_2,
        backgroundImage: `url(${cat_right})`,
        // backgroundImage: `url(${cat_right_2})`,
        top: '55%',
        left: '55%',
        width: '200px',
        height: '300px',
    },
    // point_middle: cat_point_middle,
    // point_right: cat_point_right,
}

</script>
<template>
    <!-- <div class="cat" :style="{ backgroundImage: `url(${cat_status_map[cat_status]})` }">
        Cat
    </div> -->
    <div class="cat" :style="cat_status_map.prepare" />
    <!-- <div class="cat" :style="cat_status_map.success" /> -->
    <!-- <div class="cat" :style="cat_status_map.left" /> -->
    <!-- <div class="cat" :style="cat_status_map.center" /> -->
    <!-- <div class="cat" :style="cat_status_map.right" /> -->
    <!-- <div class="cat" :style="{ backgroundImage: `url(${cat_right_2})` }">
        Cat
    </div> -->
    <!-- 
    -->
    
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
