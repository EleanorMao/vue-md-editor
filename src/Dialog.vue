<template>
    <transition name="editor-dialog-fade">
        <div class="editor-dialog__wrapper" @click.self="closeDialog('cancel')" v-show="visible">
            <div class="editor-dialog__cell">
                <div class="editor-dialog" ref="dialog">
                    <div class="editor-dialog__header" v-if="title !== undefined">
                        <div class="editor-dialog__title">{{ title }}</div>
                        <i class="fa fa-close editor-dialog__close" @click="closeDialog('cancel')"></i>
                    </div>
                    <div class="editor-dialog__content">
                        <div class="editor-dialog__body" v-if="rendered">
                            <slot></slot>
                        </div>
                    </div>
                    <div class="editor-dialog__btns">
                        <button class="editor-dialog-button" type="button" @click="closeDialog('cancel')">取消</button>
                        <button class="editor-dialog-button editor-dialog-button__primary" type="button" @click="closeDialog('sure')">插入
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>
<script>
import Popup from 'vue-popup';

export default {
    mixins: [Popup],

    props: {
        title: {
            type: String,
            default: ''
        },
        modal: {
            type: Boolean,
            default: true
        },
        closeOnClickModal: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            visible: false
        };
    },
    watch: {
        value(val) {
            this.visible = val;
        },
        visible(val) {
            this.$emit('input', val);
            if (val) {
                this.$emit('open');
                this.$nextTick(() => {
                    this.$refs.dialog.scrollTop = 0;
                });
            }
        }
    },
    methods: {
        closeDialog(val) {
            this.$emit(val);
            this.close();
        }
    },
    mounted() {
        if (this.value) {
            this.visible = true;
            this.rendered = true;
            this.open();
        }
    }
};

</script>
<style lang="less">
.editor-dialog__wrapper {
    position: fixed;
    width: 100%;
    height: 100%;
    display: table;
    top: 0;
    left: 0;
    .editor-dialog__cell {
        display: table-cell;
        vertical-align: middle;
        .editor-dialog {
            text-align: left;
            background-color: #fff;
            margin: auto;
            width: 440px;
            border-radius: 3px;
            font-size: 16px;
            -webkit-user-select: none;
            overflow: hidden;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            .editor-dialog__header {
                position: relative;
                padding: 20px 20px 0;
                .editor-dialog__title {
                    padding-left: 0;
                    margin-bottom: 0;
                    font-size: 16px;
                    font-weight: 700;
                    height: 18px;
                    color: #333;
                }
                .editor-dialog__close {
                    display: inline-block;
                    position: absolute;
                    top: 19px;
                    right: 20px;
                    color: #999;
                    cursor: pointer;
                    line-height: 20px;
                    text-align: center;
                }
            }
            .editor-dialog__content {
                padding: 30px 20px;
                color: #475669;
                font-size: 14px;
                position: relative;
                .editor-dialog__body {
                    margin: 0;
                }
            }
            .editor-dialog__btns {
                padding: 10px 20px 15px;
                text-align: right;
                .editor-dialog-button {
                    display: inline-block;
                    line-height: 1;
                    white-space: nowrap;
                    cursor: pointer;
                    background: #fff;
                    border: 1px solid #c0ccda;
                    color: #1f2d3d;
                    -webkit-appearance: none;
                    text-align: center;
                    box-sizing: border-box;
                    outline: none;
                    margin: 0;
                    -moz-user-select: none;
                    -webkit-user-select: none;
                    -ms-user-select: none;
                    padding: 10px 15px;
                    font-size: 14px;
                    border-radius: 4px;
                    &.editor-dialog-button__primary {
                        color: #fff;
                        background-color: #20a0ff;
                        border-color: #20a0ff;
                        margin-left: 10px;
                    }
                }
            }
        }
    }
}

.editor-dialog-fade-enter-active,
.editor-dialog-fade-leave-active {
    transition: opacity .5s
}

.editor-dialog-fade-enter,
.editor-dialog-fade-leave-active {
    opacity: 0
}
</style>