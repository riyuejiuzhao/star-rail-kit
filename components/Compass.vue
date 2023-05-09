<script lang="ts">
import assert from 'assert';
import exp from 'constants';
import { json } from 'stream/consumers';
class CompassRoll {
    status: number
    times: number

    //statusInit -- 位置
    //times -- 总共有多少位置
    constructor(statusInit: number, times: number) {
        this.status = statusInit
        this.times = times;
    }
}

class CompassContext {
    compasses: CompassRoll[]

    moveRule: Array<Array<number>>

    get firstMove(): number[] {
        return this.moveRule[0];
    }
    get secondMove(): number[] {
        return this.moveRule[1];
    }
    get thirdMove(): number[] {
        return this.moveRule[2];
    }

    get inner(): CompassRoll {
        return this.compasses[0];
    }

    get middle(): CompassRoll {
        return this.compasses[1];
    }

    get outer(): CompassRoll {
        return this.compasses[2];
    }

    constructor() {
        this.compasses = new Array<CompassRoll>(3);
        this.compasses[0] = new CompassRoll(0, 6);
        this.compasses[1] = new CompassRoll(0, 6);
        this.compasses[2] = new CompassRoll(0, 6);
        this.moveRule = [[1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]];
    }
    solveM(m: Array<Array<number>>): Array<number> {
        m = m.sort((a, b): number => {
            for (let i = 0; i < a.length; ++i) {
                if (a[i] == b[i])
                    continue
                return b[i] - a[i];
            }
            return 0;
        })
        console.log("79:", JSON.stringify(m))
        for (let i = 0; i < m.length; ++i) {
            for (let j = 0; j < m.length; ++j) {
                if (m[j][i] == 0 || j == i)
                    continue
                let temp = m[j][i]
                for (let k = i; k < m[j].length; ++k)
                    m[j][k] = m[j][k] - temp * m[i][k];
                let firstNot0 = 0
                for (; firstNot0 < m[j].length; ++firstNot0)
                    if (m[j][firstNot0] != 0)
                        break;
                for (let k = firstNot0+1; k < m[j].length; ++k)
                    m[j][k] = m[j][k] / m[j][firstNot0];
                m[j][firstNot0] = 1;
            }
            console.log("95:", JSON.stringify(m))
        }
        return [m[0][3], m[1][3], m[2][3]];
    }
    solve(): Array<number> {
        console.log(this)
        //根据上述数据生成矩阵
        let m = new Array<Array<number>>(3);
        for (let i = 0; i < 3; ++i)
            m[i] = [0, 0, 0, 0];
        m[0][3] = -this.inner.status;
        m[1][3] = -this.middle.status;
        m[2][3] = -this.outer.status;
        for (let i = 0; i < 3; ++i)
            m[0][i] = this.firstMove[i]
        for (let i = 0; i < 3; ++i)
            m[1][i] = this.secondMove[i]
        for (let i = 0; i < 3; ++i)
            m[2][i] = this.thirdMove[i]
        console.log("106", JSON.stringify(m))
        //解方程
        let result = this.solveM(m);
        console.log("120", JSON.stringify(result))
        for (let i = 0; i < result.length; ++i) {
            if (result[i] >= 0)
                continue;
            let times = this.compasses[i].times
            result[i] = times - ((-result[i]) % times)
        }
        return result;
    }
}

export default {
    setup() {
        let context = new CompassContext()

        const innerLight = ref(1);
        const middleLight = ref(1);
        const outerLight = ref(1);
        const result = ref([0, 0, 0]);

        const val2times = (index: number, val: number) => {
            context.compasses[index].times = 6 / val;
            result.value = context.solve()
        }

        const innerMove = ref(1)
        const middleMove = ref(1)
        const outerMove = ref(1)
        const move2Loc = (index: number, val: number) => {
            let nowCompass = context.compasses[index];
            nowCompass.status =
                (nowCompass.times - val) % nowCompass.times;
            result.value = context.solve()
        }

        const moveRules = ref([[], [], []])
        const setmove = (temp: number, names: []) => {
            for (let i = 0; i < 3; ++i)
                context.moveRule[i][temp] = 0
            for (let i = 0; i < names.length; ++i) {
                if (names[i] === '1')
                    context.moveRule[0][temp] = 1
                else if (names[i] === '2')
                    context.moveRule[1][temp] = 1
                else if (names[i] === '3')
                    context.moveRule[2][temp] = 1
            }
            result.value = context.solve()
        }
        const setmove1 = (names: any) => {
            setmove(0, names)
        }
        const setmove2 = (names: []) => {
            setmove(1, names)
        }
        const setmove3 = (names: []) => {
            setmove(2, names)
        }

        return {
            innerLight,
            middleLight,
            outerLight,
            val2times,
            innerMove,
            middleMove,
            outerMove,
            move2Loc,
            moveRules,
            setmove1,
            setmove2,
            setmove3,
            result,
        }
    },

}
</script>

<template>
    <div>
        <van-space fill direction="vertical">
            <h3>内层</h3>
            <van-space>
                <label>亮起的个数：</label>
                <van-radio-group @change="val2times(0, innerLight)" v-model="innerLight" direction="horizontal">
                    <van-radio name="1">1</van-radio>
                    <van-radio name="2">2</van-radio>
                    <van-radio name="3">3</van-radio>
                    <!--
                    <van-radio name="4">4</van-radio>
                    -->
                </van-radio-group>
            </van-space>
            <van-space>
                <label>回到原位需要旋转的次数</label>
                <van-radio-group @change="move2Loc(0, innerMove)" v-model="innerMove" direction="horizontal">
                    <van-radio name="0">0</van-radio>
                    <van-radio v-show="1 * innerLight < 6" name="1">1</van-radio>
                    <van-radio v-show="2 * innerLight < 6" name="2">2</van-radio>
                    <van-radio v-show="3 * innerLight < 6" name="3">3</van-radio>
                    <van-radio v-show="4 * innerLight < 6" name="4">4</van-radio>
                    <van-radio v-show="5 * innerLight < 6" name="5">5</van-radio>
                </van-radio-group>
            </van-space>
            <van-divider />
            <h3>中层</h3>
            <van-space>
                <label>中层亮起的个数：</label>
                <van-radio-group @change="val2times(1, middleLight)" v-model="middleLight" direction="horizontal">
                    <van-radio name="1">1</van-radio>
                    <van-radio name="2">2</van-radio>
                    <van-radio name="3">3</van-radio>
                    <!--
                    <van-radio name="4">4</van-radio>
                    -->
                </van-radio-group>
            </van-space>
            <van-space>
                <label>回到原位需要旋转的次数</label>
                <van-radio-group @change="move2Loc(1, middleMove)" v-model="middleMove" direction="horizontal">
                    <van-radio name="0">0</van-radio>
                    <van-radio v-show="1 * middleLight < 6" name="1">1</van-radio>
                    <van-radio v-show="2 * middleLight < 6" name="2">2</van-radio>
                    <van-radio v-show="3 * middleLight < 6" name="3">3</van-radio>
                    <van-radio v-show="4 * middleLight < 6" name="4">4</van-radio>
                    <van-radio v-show="5 * middleLight < 6" name="5">5</van-radio>
                </van-radio-group>
            </van-space>
            <van-divider />
            <h3>外层</h3>
            <van-space>
                <label>亮起的个数：</label>
                <van-radio-group @change="val2times(2, outerLight)" v-model="outerLight" direction="horizontal">
                    <van-radio name="1">1</van-radio>
                    <van-radio name="2">2</van-radio>
                    <van-radio name="3">3</van-radio>
                    <!--
                    <van-radio name="4">4</van-radio>
                    -->
                </van-radio-group>
            </van-space>
            <van-space>
                <label>回到原位需要旋转的次数</label>
                <van-radio-group @change="move2Loc(2, outerMove)" v-model="outerMove" direction="horizontal">
                    <van-radio name="0">0</van-radio>
                    <van-radio v-show="1 * outerLight < 6" name="1">1</van-radio>
                    <van-radio v-show="2 * outerLight < 6" name="2">2</van-radio>
                    <van-radio v-show="3 * outerLight < 6" name="3">3</van-radio>
                    <van-radio v-show="4 * outerLight < 6" name="4">4</van-radio>
                    <van-radio v-show="5 * outerLight < 6" name="5">5</van-radio>
                </van-radio-group>
            </van-space>
            <van-divider />
            <h3>圆盘旋转规律</h3>
            <van-space>
                <h5>1</h5>
                <van-checkbox-group @change="setmove1" v-model="moveRules[0]" direction="horizontal">
                    <van-checkbox name="1" shape="square">内</van-checkbox>
                    <van-checkbox name="2" shape="square">中</van-checkbox>
                    <van-checkbox name="3" shape="square">外</van-checkbox>
                </van-checkbox-group>
            </van-space>
            <van-space>
                <h5>2</h5>
                <van-checkbox-group @change="setmove2" v-model="moveRules[1]" direction="horizontal">
                    <van-checkbox name="1" shape="square">内</van-checkbox>
                    <van-checkbox name="2" shape="square">中</van-checkbox>
                    <van-checkbox name="3" shape="square">外</van-checkbox>
                </van-checkbox-group>
            </van-space>
            <van-space>
                <h5>3</h5>
                <van-checkbox-group @change="setmove3" v-model="moveRules[2]" direction="horizontal">
                    <van-checkbox name="1" shape="square">内</van-checkbox>
                    <van-checkbox name="2" shape="square">中</van-checkbox>
                    <van-checkbox name="3" shape="square">外</van-checkbox>
                </van-checkbox-group>
            </van-space>
            <van-divider />
            <h3>解法</h3>
            <van-space>
                {{ result }}
            </van-space>
        </van-space>
    </div>
</template>