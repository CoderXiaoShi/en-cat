
## 需求背景
用 vue3 开发一款猫咪互动学英语小游戏 (手机H5小游戏), 具体玩法如下

准备一张背景墙 (imgs/background.png), 和一只小猫 (imgs/cat_prepare.png)
然后准备三个文本素材, [
    {
        zh: "纸巾", 
        en: "paper towel", 
        img: "paper towel.png",
        zh_audio: "zh_paper towel.mp3",
        en_audio: "en_paper towel.mp3",
    }, {
        zh: "萝卜", 
        en: "carrot", 
        img: "carrot.png",
        zh_audio: "zh_carrot.mp3",
        en_audio: "en_carrot.mp3",
    }, {
        zh: "米老鼠", 
        en: "Mickey Mouse", 
        img: "Mickey Mouse.png",
        zh_audio: "zh_Mickey Mouse.mp3",
        en_audio: "en_Mickey Mouse.mp3",
    }
]

## 游戏玩法
    1. 先绘制一张游戏背景图, 然后将猫咪放到中下发 的位置
    2. 定义猫咪的状态, 猫咪有以下状态
        1. 等待, 猫咪在屏幕中, 但是还没有开始游戏: 此状态是猫咪的默认状态 (imgs/cat_prepare.png)
        2. 猫咪指向左, (imgs/cat_left.png)
        3. 猫咪指向中间 (imgs/cat_center.png)
        4. 猫咪指向右边 (imgs/cat_right_2.png)
        5. 小猫恭喜你答对了 (imgs/success.png)
    3. 将三个文本素材, 分别放窗口下方的左中右, 将来供猫咪选择 (绘制图形以及中文名称)
    4. 实现玩法逻辑
        1. 随机出题: 在猫咪的头顶展示三个物品的其中一个(白色圆角+黑色英文单词), 并发出英文读音
            比如随机的值为 "萝卜", 那么就展示 "萝卜" (白色圆角+黑色英文单词), 并播放 "萝卜" 的英文读音 (imgs/en_carrot.mp3)
        2. 用户选择: 用户手动点选择画面中的三个物品, 比如当用户选择左边的物品, 同时要绘制猫咪 指向左边的状态 (imgs/cat_left.png)
        3. 验证答案:
            根据 1 随机出的题, 来验证用户选择的是否正确
                - 如果用户选择对了 比如随机的题目是"纸巾", 用户也选择了 "纸巾", 那么就 绘制小猫 恭喜你的状态 (imgs/success.png)
                - 如果用户选择错了 比如随机的题目是"纸巾", 用户选择了 "萝卜", 那么就 重新播放一遍 "纸巾" 的英文发音 (imgs/en_paper towel.mp3)

## 代码规范
    1. 用 vue3 配套的工具
    2. 尽量用原生 js 实现游戏逻辑, 不依赖任何第三方库
    3. 用 ts 实现游戏逻辑
    4. 注意代码尽量简洁, 注释要简练, 注意代码的可维护性
    5. 所有的场景都要考虑国内环境, 比如 cnpm 之类的
